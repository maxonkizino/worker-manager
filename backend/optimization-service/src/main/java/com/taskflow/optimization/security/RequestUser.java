package com.taskflow.optimization.security;

import java.util.List;
import java.util.UUID;

public record RequestUser(UUID userId, List<String> roles) {
}
