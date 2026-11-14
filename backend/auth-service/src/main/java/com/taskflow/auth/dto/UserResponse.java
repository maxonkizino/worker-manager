package com.taskflow.auth.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String status,
        List<String> roles,
        int failedLoginAttempts,
        Instant lockedUntil,
        Instant lastLoginAt,
        Instant createdAt) {
}
