package com.taskflow.optimization.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateProposalRequest(
        @NotNull UUID projectId,
        @NotNull LocalDate horizonStart,
        @NotNull LocalDate horizonEnd,
        BigDecimal alpha,
        BigDecimal beta,
        BigDecimal gamma,
        BigDecimal delta) {}
