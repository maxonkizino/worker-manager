package com.taskflow.user.web.dto;

import com.taskflow.user.domain.enums.NonWorkingDayKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public final class NonWorkingDayDtos {

    private NonWorkingDayDtos() {}

    public record NonWorkingDayRequest(
            @NotNull LocalDate date,
            @NotBlank @Size(max = 150) String name,
            NonWorkingDayKind kind) {}

    public record NonWorkingDayResponse(UUID id, LocalDate date, String name, NonWorkingDayKind kind) {}
}
