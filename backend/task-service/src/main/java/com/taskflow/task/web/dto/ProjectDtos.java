package com.taskflow.task.web.dto;

import com.taskflow.task.domain.enums.ProjectRole;
import com.taskflow.task.domain.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public final class ProjectDtos {

  private ProjectDtos() {}

  public record ProjectResponse(
      UUID id,
      String name,
      String description,
      UUID managerId,
      LocalDate startDate,
      LocalDate endDate,
      ProjectStatus status,
      long dataVersion) {}

  public record CreateProjectRequest(
      @NotBlank @Size(max = 200) String name,
      String description,
      @NotNull UUID managerId,
      @NotNull LocalDate startDate,
      LocalDate endDate,
      ProjectStatus status) {}

  public record UpdateProjectRequest(
      @Size(max = 200) String name,
      String description,
      UUID managerId,
      LocalDate startDate,
      LocalDate endDate,
      ProjectStatus status) {}

  public record AddMemberRequest(@NotNull UUID employeeId, ProjectRole projectRole) {}

  public record ProjectMemberResponse(UUID employeeId, ProjectRole projectRole) {}
}
