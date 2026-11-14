package com.taskflow.analytics.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record EmployeeLoadDto(
        UUID employeeId,
        BigDecimal plannedHours,
        BigDecimal actualHours,
        BigDecimal capacityHours,
        BigDecimal utilization) {
}
