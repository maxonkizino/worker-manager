package com.taskflow.user.web.dto;

import com.taskflow.user.domain.enums.WorkScheduleType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class ScheduleDtos {

    private ScheduleDtos() {}

    public record ScheduleDayRequest(
            @NotNull @Min(1) @Max(7) Short dayOfWeek,
            @NotNull BigDecimal hours) {}

    public record ScheduleRequest(
            @NotBlank @Size(max = 100) String name,
            @NotNull WorkScheduleType type,
            @NotEmpty List<@Valid ScheduleDayRequest> days) {}

    public record ScheduleDayResponse(Short dayOfWeek, BigDecimal hours) {}

    public record ScheduleResponse(
            UUID id, String name, WorkScheduleType type, List<ScheduleDayResponse> days, Long version) {}
}
