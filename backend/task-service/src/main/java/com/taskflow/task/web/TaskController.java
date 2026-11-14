package com.taskflow.task.web;

import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import com.taskflow.task.service.TaskManagementService;
import com.taskflow.task.web.dto.TaskDtos;
import com.taskflow.task.web.dto.TaskDtos.AssignRequest;
import com.taskflow.task.web.dto.TaskDtos.CreateCommentRequest;
import com.taskflow.task.web.dto.TaskDtos.CreateTaskRequest;
import com.taskflow.task.web.dto.TaskDtos.DependencyRequest;
import com.taskflow.task.web.dto.TaskDtos.StatusChangeRequest;
import com.taskflow.task.web.dto.TaskDtos.TaskResponse;
import com.taskflow.task.web.dto.TaskDtos.UpdateTaskRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

  private final TaskManagementService taskManagementService;

  @GetMapping
  @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
  public List<TaskResponse> list(
      @RequestParam(required = false) UUID projectId,
      @RequestParam(required = false) TaskStatus status,
      @RequestParam(required = false) TaskPriority priority,
      @RequestParam(required = false) String search) {
    return taskManagementService.list(projectId, status, priority, search);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
  public TaskResponse get(@PathVariable UUID id) {
    return taskManagementService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public TaskResponse create(@Valid @RequestBody CreateTaskRequest request) {
    return taskManagementService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('MANAGER')")
  public TaskResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateTaskRequest request) {
    return taskManagementService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID id) {
    taskManagementService.delete(id);
  }

  @PostMapping("/{id}/status")
  @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
  public TaskResponse changeStatus(
      @PathVariable UUID id, @Valid @RequestBody StatusChangeRequest request) {
    return taskManagementService.changeStatus(id, request);
  }

  @PostMapping("/{id}/assignment")
  @PreAuthorize("hasRole('MANAGER')")
  public TaskResponse assign(@PathVariable UUID id, @Valid @RequestBody AssignRequest request) {
    return taskManagementService.assign(id, request);
  }

  @DeleteMapping("/{id}/assignment")
  @PreAuthorize("hasRole('MANAGER')")
  public TaskResponse unassign(@PathVariable UUID id) {
    return taskManagementService.unassign(id);
  }

  @PostMapping("/{id}/dependencies")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public void addDependency(@PathVariable UUID id, @Valid @RequestBody DependencyRequest request) {
    taskManagementService.addDependency(id, request);
  }

  @GetMapping("/{id}/comments")
  @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
  public List<TaskDtos.CommentResponse> comments(@PathVariable UUID id) {
    return taskManagementService.listComments(id);
  }

  @PostMapping("/{id}/comments")
  @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
  @ResponseStatus(HttpStatus.CREATED)
  public TaskDtos.CommentResponse addComment(
      @PathVariable UUID id, @Valid @RequestBody CreateCommentRequest request) {
    return taskManagementService.addComment(id, request);
  }
}
