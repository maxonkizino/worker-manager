package com.taskflow.analytics.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DeadlineReportItemDto(
        UUID taskId,
        UUID projectId,
        UUID assigneeId,
        String status,
        String priority,
        LocalDate plannedEnd,
        BigDecimal estimatedHours,
        BigDecimal actualHours) {
}
