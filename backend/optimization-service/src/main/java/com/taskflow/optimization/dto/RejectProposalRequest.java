package com.taskflow.optimization.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectProposalRequest(@NotBlank String comment) {}
