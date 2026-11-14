package com.taskflow.user.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class SettingsDtos {

    private SettingsDtos() {}

    public record SettingsResponse(
            BigDecimal usefulTimeFactor,
            BigDecimal overloadThreshold,
            BigDecimal underloadThreshold,
            BigDecimal alpha,
            BigDecimal beta,
            BigDecimal gamma,
            BigDecimal delta,
            Integer horizonDays,
            Instant updatedAt,
            UUID updatedBy,
            Long version) {}

    public record SettingsUpdateRequest(
            @NotNull BigDecimal usefulTimeFactor,
            @NotNull BigDecimal overloadThreshold,
            @NotNull BigDecimal underloadThreshold,
            @NotNull BigDecimal alpha,
            @NotNull BigDecimal beta,
            @NotNull BigDecimal gamma,
            @NotNull BigDecimal delta,
            @NotNull Integer horizonDays) {}
}
