package com.taskflow.optimization.dto;

import java.util.UUID;

public record CreateProposalResponse(UUID proposalId, ProposalSummaryResponse summary) {}
