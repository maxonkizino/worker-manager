package com.taskflow.optimization.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TaskSnapshotDto(
        Long dataVersion,
        UUID projectId,
        List<TaskSnapshotItemDto> tasks,
        List<UUID> projectMemberEmployeeIds) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TaskSnapshotItemDto(
            UUID id,
            String status,
            String priority,
            BigDecimal estimatedHours,
            LocalDate plannedStart,
            LocalDate plannedEnd,
            List<SkillRequirementDto> skillRequirements,
            List<UUID> dependsOnTaskIds,
            CurrentAssignmentDto currentAssignment) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SkillRequirementDto(UUID skillId, int minLevel) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CurrentAssignmentDto(UUID employeeId, BigDecimal plannedHours) {}
}
