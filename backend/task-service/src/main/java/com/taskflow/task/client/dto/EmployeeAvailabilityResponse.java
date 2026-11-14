package com.taskflow.task.client.dto;

import java.util.List;

public record EmployeeAvailabilityResponse(
    boolean available, List<String> warnings, List<String> blockingReasons) {}
