package com.taskflow.auth.dto;

import java.util.List;
import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UUID userId,
        String username,
        List<String> roles) {
}
