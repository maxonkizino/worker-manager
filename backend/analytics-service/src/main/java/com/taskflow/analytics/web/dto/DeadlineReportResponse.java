package com.taskflow.analytics.web.dto;

import java.time.LocalDate;
import java.util.List;

public record DeadlineReportResponse(LocalDate from, LocalDate to, List<DeadlineReportItemDto> tasks) {
}
