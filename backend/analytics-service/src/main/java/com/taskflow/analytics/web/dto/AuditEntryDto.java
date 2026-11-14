package com.taskflow.analytics.web.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AuditEntryDto(
        UUID id,
        UUID actorId,
        String action,
        String entityType,
        UUID entityId,
        Map<String, Object> details,
        Instant occurredAt) {
}
