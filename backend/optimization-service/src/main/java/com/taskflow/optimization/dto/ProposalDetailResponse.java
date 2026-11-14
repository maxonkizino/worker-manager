package com.taskflow.optimization.dto;

import com.taskflow.optimization.domain.ProposalStatus;
import com.taskflow.optimization.domain.UnassignedReasonCode;
import com.taskflow.optimization.domain.VariantItemReasonCode;
import com.taskflow.optimization.domain.VariantKind;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProposalDetailResponse(
        UUID id,
        UUID projectId,
        ProposalStatus status,
        Instant requestedAt,
        Instant appliedAt,
        Instant rejectedAt,
        UUID requestedBy,
        List<VariantView> variants,
        List<String> warnings) {

    public record VariantView(
            UUID id,
            VariantKind kind,
            boolean selected,
            BigDecimal objectiveScore,
            List<AssignmentView> assignments,
            List<UnassignedView> unassigned) {}

    public record AssignmentView(
            UUID taskId,
            UUID employeeId,
            BigDecimal plannedHours,
            VariantItemReasonCode reasonCode,
            String explanation) {}

    public record UnassignedView(UUID taskId, UnassignedReasonCode reasonCode, String explanation) {}
}
