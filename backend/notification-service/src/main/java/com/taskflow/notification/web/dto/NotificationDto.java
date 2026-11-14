package com.taskflow.notification.web.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        String type,
        String title,
        String body,
        Map<String, Object> payload,
        Instant createdAt,
        Instant readAt) {
}
