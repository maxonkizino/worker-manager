package com.taskflow.task.web.dto;

import com.taskflow.task.domain.enums.AssignmentSource;
import com.taskflow.task.domain.enums.AssignmentStatus;
import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class InternalDtos {

  private InternalDtos() {}

  public record SnapshotResponse(
      UUID projectId,
      long dataVersion,
      LocalDate from,
      LocalDate to,
      List<SnapshotTask> tasks,
      List<SnapshotDependency> dependencies,
      List<SnapshotSkillRequirement> skillRequirements,
      List<SnapshotAssignment> assignments) {}

  public record SnapshotTask(
      UUID id,
      String title,
      TaskStatus status,
      TaskPriority priority,
      LocalDate plannedStart,
      LocalDate plannedEnd,
      BigDecimal estimatedHours) {}

  public record SnapshotDependency(UUID taskId, UUID dependsOnTaskId) {}

  public record SnapshotSkillRequirement(UUID taskId, UUID skillId, short minLevel) {}

  public record SnapshotAssignment(UUID taskId, UUID employeeId, AssignmentStatus status, AssignmentSource source) {}

  public record BatchAssignmentsRequest(
      @NotNull UUID projectId, @NotNull Long dataVersion, @NotNull List<BatchAssignmentItem> items) {}

  public record BatchAssignmentItem(@NotNull UUID taskId, @NotNull UUID employeeId) {}

  public record BatchAssignmentsResponse(long dataVersion, int applied) {}
}
