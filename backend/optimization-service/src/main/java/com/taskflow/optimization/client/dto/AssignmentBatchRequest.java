package com.taskflow.optimization.client.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AssignmentBatchRequest(
        Long dataVersion, UUID proposalId, List<AssignmentItemDto> assignments) {

    public record AssignmentItemDto(UUID taskId, UUID employeeId, BigDecimal plannedHours) {}
}
