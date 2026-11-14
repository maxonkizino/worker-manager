package com.taskflow.user.web.dto;

import com.taskflow.user.domain.enums.AbsenceStatus;
import com.taskflow.user.domain.enums.AbsenceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class AbsenceDtos {

    private AbsenceDtos() {}

    public record AbsenceRequest(
            @NotNull AbsenceType type,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @Size(max = 500) String comment) {}

    public record DecisionRequest(@Size(max = 500) String decisionComment) {}

    public record AbsenceResponse(
            UUID id,
            UUID employeeId,
            AbsenceType type,
            LocalDate startDate,
            LocalDate endDate,
            AbsenceStatus status,
            String comment,
            UUID decidedBy,
            Instant decidedAt,
            String decisionComment,
            Long version) {}
}
