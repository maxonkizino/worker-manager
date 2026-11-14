package com.taskflow.optimization.exception;

import java.util.UUID;

public class ProposalNotFoundException extends RuntimeException {

    public ProposalNotFoundException(UUID id) {
        super("Optimization proposal not found: " + id);
    }
}
