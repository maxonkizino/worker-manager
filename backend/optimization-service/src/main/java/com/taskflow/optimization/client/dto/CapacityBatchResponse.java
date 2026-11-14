package com.taskflow.optimization.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CapacityBatchResponse(List<EmployeeCapacityDto> capacities) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EmployeeCapacityDto(
            UUID employeeId,
            BigDecimal totalCapacityHours,
            BigDecimal plannedLoadHours,
            List<EmployeeSkillDto> skills) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EmployeeSkillDto(UUID skillId, int level) {}
}
