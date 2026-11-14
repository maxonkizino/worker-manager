package com.taskflow.user.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class SkillDtos {

    private SkillDtos() {}

    public record SkillRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 500) String description,
            Boolean active) {}

    public record SkillResponse(UUID id, String name, String description, boolean active, Long version) {}
}
