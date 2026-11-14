package com.taskflow.user.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class DepartmentDtos {

    private DepartmentDtos() {}

    public record DepartmentRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 500) String description,
            UUID headEmployeeId) {}

    public record DepartmentResponse(
            UUID id, String name, String description, UUID headEmployeeId, Long version) {}
}
