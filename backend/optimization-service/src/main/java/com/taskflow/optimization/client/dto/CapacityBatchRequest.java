package com.taskflow.optimization.client.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CapacityBatchRequest(List<UUID> employeeIds, LocalDate from, LocalDate to) {}
