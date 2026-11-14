package com.taskflow.analytics.web.dto;

import java.time.LocalDate;
import java.util.List;

public record TeamLoadResponse(LocalDate from, LocalDate to, List<EmployeeLoadDto> members) {
}
