package com.taskflow.task.service;

import com.taskflow.task.client.UserServiceClient;
import com.taskflow.task.client.UserServiceClient.AvailabilityResult;
import com.taskflow.task.domain.Assignment;
import com.taskflow.task.domain.TaskComment;
import com.taskflow.task.domain.TaskDependency;
import com.taskflow.task.domain.TaskDependencyId;
import com.taskflow.task.domain.TaskEntity;
import com.taskflow.task.domain.TimeEntry;
import com.taskflow.task.domain.enums.AssignmentSource;
import com.taskflow.task.domain.enums.AssignmentStatus;
import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import com.taskflow.task.exception.BadRequestException;
import com.taskflow.task.exception.ConflictException;
import com.taskflow.task.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.taskflow.task.repository.AssignmentRepository;
import com.taskflow.task.repository.ProjectMemberRepository;
import com.taskflow.task.repository.ProjectRepository;
import com.taskflow.task.repository.TaskCommentRepository;
import com.taskflow.task.repository.TaskDependencyRepository;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.task.repository.TimeEntryRepository;
import com.taskflow.task.security.SecurityUtils;
import com.taskflow.task.web.dto.TaskDtos;
import com.taskflow.task.web.dto.TaskDtos.AssignRequest;
import com.taskflow.task.web.dto.TaskDtos.CreateCommentRequest;
import com.taskflow.task.web.dto.TaskDtos.CreateTaskRequest;
import com.taskflow.task.web.dto.TaskDtos.CreateTimeEntryRequest;
import com.taskflow.task.web.dto.TaskDtos.DependencyRequest;
import com.taskflow.task.web.dto.TaskDtos.StatusChangeRequest;
import com.taskflow.task.web.dto.TaskDtos.TaskResponse;
import com.taskflow.task.web.dto.TaskDtos.UpdateTaskRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskManagementService {

  private final TaskRepository taskRepository;
  private final ProjectRepository projectRepository;
  private final ProjectMemberRepository projectMemberRepository;
  private final AssignmentRepository assignmentRepository;
  private final TaskDependencyRepository taskDependencyRepository;
  private final TaskCommentRepository taskCommentRepository;
  private final TimeEntryRepository timeEntryRepository;
  private final TaskStatusTransitionValidator statusTransitionValidator;
  private final DependencyCycleDetector cycleDetector;
  private final OutboxService outboxService;
  private final ProjectPlanVersionService planVersionService;
  private final UserServiceClient userServiceClient;

  @Transactional(readOnly = true)
  public List<TaskResponse> list(UUID projectId, TaskStatus status, TaskPriority priority, String search) {
    List<Specification<TaskEntity>> specs = new ArrayList<>();
    if (projectId != null) {
      specs.add((root, q, cb) -> cb.equal(root.get("projectId"), projectId));
    }
    if (status != null) {
      specs.add((root, q, cb) -> cb.equal(root.get("status"), status));
    }
    if (priority != null) {
      specs.add((root, q, cb) -> cb.equal(root.get("priority"), priority));
    }
    if (search != null && !search.isBlank()) {
      String pattern = "%" + search.trim().toLowerCase() + "%";
      specs.add((root, q, cb) -> cb.like(cb.lower(root.get("title")), pattern));
    }
    if (SecurityUtils.isEmployeeOnly()) {
      List<UUID> ownTaskIds =
          assignmentRepository
              .findByEmployeeIdAndStatus(SecurityUtils.requireUserId(), AssignmentStatus.ACTIVE)
              .stream()
              .map(Assignment::getTaskId)
              .toList();
      if (ownTaskIds.isEmpty()) {
        return List.of();
      }
      specs.add((root, q, cb) -> root.get("id").in(ownTaskIds));
    }
    Specification<TaskEntity> spec =
        specs.isEmpty() ? (root, q, cb) -> cb.conjunction() : Specification.allOf(specs);
    return taskRepository.findAll(spec).stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public TaskResponse get(UUID id) {
    requireVisible(id);
    return toResponse(loadTask(id));
  }

  @Transactional
  public TaskResponse create(CreateTaskRequest request) {
    ensureProject(request.projectId());
    TaskEntity task = new TaskEntity();
    task.setProjectId(request.projectId());
    task.setTitle(request.title());
    task.setDescription(request.description());
    task.setCreatedBy(SecurityUtils.requireUserId());
    task.setPriority(request.priority());
    task.setPlannedStart(request.plannedStart());
    task.setPlannedEnd(request.plannedEnd());
    task.setEstimatedHours(request.estimatedHours());
    task = taskRepository.save(task);
    planVersionService.bumpDataVersion(request.projectId());
    outboxService.publish("Task", task.getId(), "task.created", taskPayload(task, null));
    return toResponse(task);
  }

  @Transactional
  public TaskResponse update(UUID id, UpdateTaskRequest request) {
    TaskEntity task = loadTask(id);
    if (request.title() != null) {
      task.setTitle(request.title());
    }
    if (request.description() != null) {
      task.setDescription(request.description());
    }
    if (request.priority() != null) {
      task.setPriority(request.priority());
    }
    if (request.plannedStart() != null) {
      task.setPlannedStart(request.plannedStart());
    }
    if (request.plannedEnd() != null) {
      task.setPlannedEnd(request.plannedEnd());
    }
    if (request.estimatedHours() != null) {
      task.setEstimatedHours(request.estimatedHours());
    }
    validatePeriod(task.getPlannedStart(), task.getPlannedEnd());
    task = taskRepository.save(task);
    planVersionService.bumpDataVersion(task.getProjectId());
    outboxService.publish("Task", task.getId(), "task.updated", taskPayload(task, null));
    return toResponse(task);
  }

  @Transactional
  public void delete(UUID id) {
    TaskEntity task = loadTask(id);
    UUID projectId = task.getProjectId();
    taskRepository.delete(task);
    planVersionService.bumpDataVersion(projectId);
  }

  @Transactional
  public TaskResponse changeStatus(UUID id, StatusChangeRequest request) {
    requireVisible(id);
    TaskEntity task = loadTask(id);
    TaskStatus target = request.status();
    statusTransitionValidator.validate(task.getStatus(), target);
    if (target == TaskStatus.IN_PROGRESS) {
      ensurePredecessorsDone(id);
    }
  if (target == TaskStatus.DONE) {
      assignmentRepository
          .findByTaskIdAndStatus(id, AssignmentStatus.ACTIVE)
          .ifPresent(
              a -> {
                a.setStatus(AssignmentStatus.COMPLETED);
                a.setCompletedAt(Instant.now());
                assignmentRepository.save(a);
              });
    }
    TaskStatus previous = task.getStatus();
    task.setStatus(target);
    task = taskRepository.save(task);
    planVersionService.bumpDataVersion(task.getProjectId());
    Map<String, Object> statusPayload = taskPayload(task, null);
    statusPayload.put("from", previous.name());
    statusPayload.put("to", target.name());
    outboxService.publish("Task", task.getId(), "task.status-changed", statusPayload);
    return toResponse(task);
  }

  @Transactional
  public TaskResponse assign(UUID id, AssignRequest request) {
    TaskEntity task = loadTask(id);
    if (task.getStatus() == TaskStatus.DONE || task.getStatus() == TaskStatus.CANCELLED) {
      throw new BadRequestException("Cannot assign task in status " + task.getStatus());
    }
    if (!projectMemberRepository.existsByIdProjectIdAndIdEmployeeId(
        task.getProjectId(), request.employeeId())) {
      throw new BadRequestException("Employee is not a project member");
    }
    LocalDate from = task.getPlannedStart() != null ? task.getPlannedStart() : LocalDate.now();
    LocalDate to = task.getPlannedEnd() != null ? task.getPlannedEnd() : from.plusDays(30);
    AvailabilityResult availability =
        userServiceClient.checkAvailability(request.employeeId(), from, to);
    List<String> warnings = new ArrayList<>();
    if (!availability.reachable()) {
      warnings.add(availability.warning());
    } else if (availability.response() != null && availability.response().warnings() != null) {
      warnings.addAll(availability.response().warnings());
    }

    assignmentRepository
        .findByTaskIdAndStatus(id, AssignmentStatus.ACTIVE)
        .ifPresent(
            existing -> {
              existing.setStatus(AssignmentStatus.CANCELLED);
              assignmentRepository.save(existing);
            });

    Assignment assignment = new Assignment();
    assignment.setTaskId(id);
    assignment.setEmployeeId(request.employeeId());
    assignment.setAssignedBy(SecurityUtils.requireUserId());
    assignment.setPlannedHours(task.getEstimatedHours());
    assignment.setSource(AssignmentSource.MANUAL);
    assignmentRepository.save(assignment);

    if (task.getStatus() == TaskStatus.CREATED || task.getStatus() == TaskStatus.ASSIGNED) {
      statusTransitionValidator.validate(task.getStatus(), TaskStatus.ASSIGNED);
      task.setStatus(TaskStatus.ASSIGNED);
    } else if (task.getStatus() == TaskStatus.IN_PROGRESS) {
      statusTransitionValidator.validate(task.getStatus(), TaskStatus.ASSIGNED);
      task.setStatus(TaskStatus.ASSIGNED);
    }
    taskRepository.save(task);
    planVersionService.bumpDataVersion(task.getProjectId());
    outboxService.publish(
        "Task",
        task.getId(),
        "task.assigned",
        assignedPayload(task, request.employeeId()));
    return toResponse(task, request.employeeId(), warnings);
  }

  @Transactional
  public TaskResponse unassign(UUID id) {
    TaskEntity task = loadTask(id);
    assignmentRepository
        .findByTaskIdAndStatus(id, AssignmentStatus.ACTIVE)
        .ifPresent(
            a -> {
              a.setStatus(AssignmentStatus.CANCELLED);
              assignmentRepository.save(a);
            });
    if (task.getStatus() == TaskStatus.ASSIGNED || task.getStatus() == TaskStatus.IN_PROGRESS) {
      statusTransitionValidator.validate(task.getStatus(), TaskStatus.CREATED);
      task.setStatus(TaskStatus.CREATED);
    }
    taskRepository.save(task);
    planVersionService.bumpDataVersion(task.getProjectId());
    outboxService.publish(
        "Task",
        task.getId(),
        "task.unassigned",
        Map.of("taskId", task.getId(), "projectId", task.getProjectId()));
    return toResponse(task);
  }

  @Transactional
  public void addDependency(UUID id, DependencyRequest request) {
    TaskEntity task = loadTask(id);
    TaskEntity dependsOn = loadTask(request.dependsOnTaskId());
    if (!task.getProjectId().equals(dependsOn.getProjectId())) {
      throw new BadRequestException("Dependencies must be within the same project");
    }
    Map<UUID, List<UUID>> graph = loadDependencyGraph(task.getProjectId());
    if (cycleDetector.wouldCreateCycle(id, request.dependsOnTaskId(), graph)) {
      throw new BadRequestException("Dependency would create a cycle");
    }
    TaskDependency dep = new TaskDependency();
    dep.setId(new TaskDependencyId(id, request.dependsOnTaskId()));
    try {
      taskDependencyRepository.save(dep);
    } catch (Exception ex) {
      throw new ConflictException("Dependency already exists");
    }
    planVersionService.bumpDataVersion(task.getProjectId());
  }

  @Transactional
  public TaskDtos.TimeEntryResponse addTimeEntry(CreateTimeEntryRequest request) {
    requireVisible(request.taskId());
    loadTask(request.taskId());
    if (request.hours().compareTo(java.math.BigDecimal.valueOf(24)) > 0) {
      throw new BadRequestException("hours must be <= 24");
    }
    TimeEntry entry = new TimeEntry();
    UUID employeeId = SecurityUtils.requireUserId();
    entry.setTaskId(request.taskId());
    entry.setEmployeeId(employeeId);
    entry.setWorkDate(request.workDate());
    entry.setHours(request.hours());
    entry.setDescription(request.description());
    entry = timeEntryRepository.save(entry);

    TaskEntity task = loadTask(request.taskId());
    task.setActualHours(timeEntryRepository.sumHoursByTaskId(request.taskId()));
    taskRepository.save(task);

    Map<String, Object> timePayload = new java.util.LinkedHashMap<>();
    timePayload.put("timeEntryId", entry.getId());
    timePayload.put("taskId", request.taskId());
    timePayload.put("employeeId", employeeId);
    timePayload.put("workDate", request.workDate().toString());
    timePayload.put("hours", request.hours());
    outboxService.publish("TimeEntry", entry.getId(), "timeentry.created", timePayload);
    return new TaskDtos.TimeEntryResponse(
        entry.getId(), entry.getTaskId(), entry.getEmployeeId(), entry.getWorkDate(), entry.getHours());
  }

  @Transactional(readOnly = true)
  public List<TaskDtos.CommentResponse> listComments(UUID taskId) {
    requireVisible(taskId);
    loadTask(taskId);
    return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
        .map(this::toCommentResponse)
        .toList();
  }

  @Transactional
  public TaskDtos.CommentResponse addComment(UUID taskId, CreateCommentRequest request) {
    requireVisible(taskId);
    loadTask(taskId);
    TaskComment comment = new TaskComment();
    comment.setTaskId(taskId);
    comment.setAuthorId(SecurityUtils.requireUserId());
    comment.setBody(request.body().trim());
    comment = taskCommentRepository.save(comment);
    return toCommentResponse(comment);
  }

  private Map<UUID, List<UUID>> loadDependencyGraph(UUID projectId) {
    List<TaskEntity> tasks = taskRepository.findByProjectId(projectId);
    List<UUID> taskIds = tasks.stream().map(TaskEntity::getId).toList();
    Map<UUID, List<UUID>> graph = new HashMap<>();
    for (UUID taskId : taskIds) {
      graph.put(taskId, taskDependencyRepository.findDependsOnIds(taskId));
    }
    return graph;
  }

  private void ensurePredecessorsDone(UUID taskId) {
    List<UUID> predecessorIds = taskDependencyRepository.findDependsOnIds(taskId);
    if (predecessorIds.isEmpty()) {
      return;
    }
    List<TaskEntity> predecessors = taskRepository.findAllById(predecessorIds);
    boolean blocked =
        predecessors.stream().anyMatch(t -> t.getStatus() != TaskStatus.DONE);
    if (blocked) {
      throw new BadRequestException("Cannot start task until all predecessor tasks are DONE");
    }
  }

  private void ensureProject(UUID projectId) {
    if (!projectRepository.existsById(projectId)) {
      throw new NotFoundException("Project not found: " + projectId);
    }
  }

  private void requireVisible(UUID taskId) {
    if (!SecurityUtils.isEmployeeOnly()) {
      return;
    }
    boolean assigned =
        assignmentRepository
            .findByTaskIdAndStatus(taskId, AssignmentStatus.ACTIVE)
            .map(assignment -> assignment.getEmployeeId().equals(SecurityUtils.requireUserId()))
            .orElse(false);
    if (!assigned) {
      throw new AccessDeniedException("Задача доступна только её исполнителю");
    }
  }

  private TaskEntity loadTask(UUID id) {
    return taskRepository
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Task not found: " + id));
  }

  private void validatePeriod(LocalDate start, LocalDate end) {
    if (start != null && end != null && end.isBefore(start)) {
      throw new BadRequestException("plannedEnd must be on or after plannedStart");
    }
  }

  private Map<String, Object> assignedPayload(TaskEntity task, UUID employeeId) {
    Map<String, Object> payload = taskPayload(task, employeeId);
    payload.put("source", "MANUAL");
    return payload;
  }

  private Map<String, Object> taskPayload(TaskEntity task, UUID assigneeId) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("taskId", task.getId());
    payload.put("projectId", task.getProjectId());
    payload.put("title", task.getTitle());
    payload.put("taskTitle", task.getTitle());
    payload.put("status", task.getStatus().name());
    payload.put("priority", task.getPriority().name());
    payload.put("estimatedHours", task.getEstimatedHours());
    if (task.getPlannedStart() != null) {
      payload.put("plannedStart", task.getPlannedStart().toString());
    }
    if (task.getPlannedEnd() != null) {
      payload.put("plannedEnd", task.getPlannedEnd().toString());
    }
    if (task.getActualHours() != null) {
      payload.put("actualHours", task.getActualHours());
    }
    if (assigneeId != null) {
      payload.put("assigneeId", assigneeId);
      payload.put("employeeId", assigneeId);
    }
    return payload;
  }

  private TaskResponse toResponse(TaskEntity task) {
    UUID assignee =
        assignmentRepository
            .findByTaskIdAndStatus(task.getId(), AssignmentStatus.ACTIVE)
            .map(Assignment::getEmployeeId)
            .orElse(null);
    return toResponse(task, assignee, List.of());
  }

  private TaskResponse toResponse(TaskEntity task, UUID activeAssigneeId, List<String> warnings) {
    return new TaskResponse(
        task.getId(),
        task.getProjectId(),
        task.getTitle(),
        task.getDescription(),
        task.getCreatedBy(),
        task.getStatus(),
        task.getPriority(),
        task.getPlannedStart(),
        task.getPlannedEnd(),
        task.getEstimatedHours(),
        task.getActualHours(),
        activeAssigneeId,
        warnings);
  }

  private TaskDtos.CommentResponse toCommentResponse(TaskComment comment) {
    String created = comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null;
    return new TaskDtos.CommentResponse(
        comment.getId(), comment.getTaskId(), comment.getAuthorId(), comment.getBody(), created);
  }
}
