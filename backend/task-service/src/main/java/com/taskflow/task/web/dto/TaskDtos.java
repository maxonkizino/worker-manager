package com.taskflow.task.web.dto;

import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class TaskDtos {

  private TaskDtos() {}

  public record TaskResponse(
      UUID id,
      UUID projectId,
      String title,
      String description,
      UUID createdBy,
      TaskStatus status,
      TaskPriority priority,
      LocalDate plannedStart,
      LocalDate plannedEnd,
      BigDecimal estimatedHours,
      BigDecimal actualHours,
      UUID activeAssigneeId,
      List<String> warnings) {}

  public record CreateTaskRequest(
      @NotNull UUID projectId,
      @NotBlank @Size(max = 250) String title,
      String description,
      @NotNull TaskPriority priority,
      LocalDate plannedStart,
      LocalDate plannedEnd,
      @NotNull @DecimalMin(value = "0.01", inclusive = true) BigDecimal estimatedHours) {}

  public record UpdateTaskRequest(
      @Size(max = 250) String title,
      String description,
      TaskPriority priority,
      LocalDate plannedStart,
      LocalDate plannedEnd,
      @DecimalMin(value = "0.01", inclusive = true) BigDecimal estimatedHours) {}

  public record StatusChangeRequest(@NotNull TaskStatus status) {}

  public record AssignRequest(@NotNull UUID employeeId) {}

  public record DependencyRequest(@NotNull UUID dependsOnTaskId) {}

  public record CommentResponse(UUID id, UUID taskId, UUID authorId, String body, String createdAt) {}

  public record CreateCommentRequest(@NotBlank @Size(max = 5000) String body) {}

  public record CreateTimeEntryRequest(
      @NotNull UUID taskId,
      @NotNull LocalDate workDate,
      @NotNull @DecimalMin(value = "0.01") BigDecimal hours,
      @Size(max = 1000) String description) {}

  public record TimeEntryResponse(UUID id, UUID taskId, UUID employeeId, LocalDate workDate, BigDecimal hours) {}
}
