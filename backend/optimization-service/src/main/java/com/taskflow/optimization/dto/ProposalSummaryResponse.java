package com.taskflow.optimization.dto;

import com.taskflow.optimization.domain.ProposalStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProposalSummaryResponse(
        UUID id,
        UUID projectId,
        ProposalStatus status,
        Instant requestedAt,
        int assignedCount,
        int unassignedCount,
        BigDecimal objectiveScore,
        List<String> warnings,
        String explanation) {}
