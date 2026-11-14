package com.taskflow.task.service;

import com.taskflow.task.domain.Assignment;
import com.taskflow.task.domain.TaskEntity;
import com.taskflow.task.domain.TaskSkillRequirement;
import com.taskflow.task.domain.enums.AssignmentSource;
import com.taskflow.task.domain.enums.AssignmentStatus;
import com.taskflow.task.domain.enums.TaskStatus;
import com.taskflow.task.exception.NotFoundException;
import com.taskflow.task.repository.AssignmentRepository;
import com.taskflow.task.repository.ProjectRepository;
import com.taskflow.task.repository.TaskDependencyRepository;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.task.repository.TaskSkillRequirementRepository;
import com.taskflow.task.security.SecurityUtils;
import com.taskflow.task.web.dto.InternalDtos;
import com.taskflow.task.web.dto.InternalDtos.BatchAssignmentItem;
import com.taskflow.task.web.dto.InternalDtos.BatchAssignmentsRequest;
import com.taskflow.task.web.dto.InternalDtos.BatchAssignmentsResponse;
import com.taskflow.task.web.dto.InternalDtos.SnapshotAssignment;
import com.taskflow.task.web.dto.InternalDtos.SnapshotDependency;
import com.taskflow.task.web.dto.InternalDtos.SnapshotResponse;
import com.taskflow.task.web.dto.InternalDtos.SnapshotSkillRequirement;
import com.taskflow.task.web.dto.InternalDtos.SnapshotTask;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InternalTaskService {

  private final ProjectRepository projectRepository;
  private final TaskRepository taskRepository;
  private final TaskDependencyRepository taskDependencyRepository;
  private final TaskSkillRequirementRepository skillRequirementRepository;
  private final AssignmentRepository assignmentRepository;
  private final ProjectPlanVersionService planVersionService;
  private final OutboxService outboxService;
  private final TaskStatusTransitionValidator statusTransitionValidator;

  @Transactional(readOnly = true)
  public SnapshotResponse snapshot(UUID projectId, LocalDate from, LocalDate to) {
    if (!projectRepository.existsById(projectId)) {
      throw new NotFoundException("Project not found: " + projectId);
    }
    List<TaskEntity> tasks = taskRepository.findByProjectId(projectId);
    List<UUID> taskIds = tasks.stream().map(TaskEntity::getId).toList();

    List<SnapshotTask> snapshotTasks =
        tasks.stream()
            .map(
                t ->
                    new SnapshotTask(
                        t.getId(),
                        t.getTitle(),
                        t.getStatus(),
                        t.getPriority(),
                        t.getPlannedStart(),
                        t.getPlannedEnd(),
                        t.getEstimatedHours()))
            .toList();

    List<SnapshotDependency> dependencies =
        taskIds.stream()
            .flatMap(
                taskId ->
                    taskDependencyRepository.findByIdTaskId(taskId).stream()
                        .map(
                            d ->
                                new SnapshotDependency(
                                    d.getId().getTaskId(), d.getId().getDependsOnTaskId())))
            .toList();

    List<SnapshotSkillRequirement> skills =
        skillRequirementRepository.findByIdTaskIdIn(taskIds).stream()
            .map(s -> new SnapshotSkillRequirement(
                s.getId().getTaskId(), s.getId().getSkillId(), s.getMinLevel()))
            .toList();

    List<SnapshotAssignment> assignments =
        assignmentRepository.findByTaskIdInAndStatus(taskIds, AssignmentStatus.ACTIVE).stream()
            .map(
                a ->
                    new SnapshotAssignment(
                        a.getTaskId(), a.getEmployeeId(), a.getStatus(), a.getSource()))
            .toList();

    long dataVersion = planVersionService.getDataVersion(projectId);
    return new SnapshotResponse(projectId, dataVersion, from, to, snapshotTasks, dependencies, skills, assignments);
  }

  @Transactional
  public BatchAssignmentsResponse applyBatch(BatchAssignmentsRequest request) {
    UUID projectId = request.projectId();
    if (!projectRepository.existsById(projectId)) {
      throw new NotFoundException("Project not found: " + projectId);
    }
    planVersionService.assertDataVersion(projectId, request.dataVersion());
    UUID actor =
        SecurityUtils.currentUserIdOr(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    int applied = 0;
    for (BatchAssignmentItem item : request.items()) {
      TaskEntity task =
          taskRepository
              .findById(item.taskId())
              .orElseThrow(() -> new NotFoundException("Task not found: " + item.taskId()));
      if (!task.getProjectId().equals(projectId)) {
        throw new IllegalArgumentException("Task " + item.taskId() + " does not belong to project");
      }
      assignmentRepository
          .findByTaskIdAndStatus(item.taskId(), AssignmentStatus.ACTIVE)
          .ifPresent(
              existing -> {
                existing.setStatus(AssignmentStatus.CANCELLED);
                assignmentRepository.save(existing);
              });
      Assignment assignment = new Assignment();
      assignment.setTaskId(item.taskId());
      assignment.setEmployeeId(item.employeeId());
      assignment.setAssignedBy(actor);
      assignment.setPlannedHours(task.getEstimatedHours());
      assignment.setSource(AssignmentSource.OPTIMIZER);
      assignmentRepository.save(assignment);
      if (task.getStatus() == TaskStatus.CREATED) {
        statusTransitionValidator.validate(task.getStatus(), TaskStatus.ASSIGNED);
        task.setStatus(TaskStatus.ASSIGNED);
        taskRepository.save(task);
      }
      outboxService.publish(
          "Task",
          task.getId(),
          "task.assigned",
          assignedPayload(task, projectId, item.employeeId()));
      applied++;
    }
    planVersionService.bumpDataVersion(projectId);
    long newVersion = planVersionService.getDataVersion(projectId);
    return new BatchAssignmentsResponse(newVersion, applied);
  }

  private static Map<String, Object> assignedPayload(TaskEntity task, UUID projectId, UUID employeeId) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("taskId", task.getId());
    payload.put("projectId", projectId);
    payload.put("employeeId", employeeId);
    payload.put("assigneeId", employeeId);
    payload.put("title", task.getTitle());
    payload.put("taskTitle", task.getTitle());
    payload.put("status", task.getStatus().name());
    payload.put("source", "OPTIMIZER");
    return payload;
  }
}
