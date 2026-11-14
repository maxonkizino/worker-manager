package com.taskflow.analytics.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PersonalLoadDto(
        UUID employeeId,
        LocalDate from,
        LocalDate to,
        BigDecimal plannedHours,
        BigDecimal actualHours,
        BigDecimal capacityHours,
        BigDecimal utilization) {
}
