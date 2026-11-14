package com.taskflow.analytics.service;

import com.taskflow.analytics.domain.AuditLog;
import com.taskflow.analytics.repository.AuditLogRepository;
import com.taskflow.analytics.web.dto.AuditEntryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<AuditEntryDto> recent(int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), 50);
        return auditLogRepository.findTop50ByOrderByOccurredAtDesc().stream()
                .limit(effectiveLimit)
                .map(AuditService::toDto)
                .toList();
    }

    @Transactional
    public void record(UUID actorId, String action, String entityType, UUID entityId, Map<String, Object> details) {
        AuditLog entry = new AuditLog();
        entry.setActorId(actorId);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details == null ? Map.of() : details);
        auditLogRepository.save(entry);
    }

    private static AuditEntryDto toDto(AuditLog log) {
        return new AuditEntryDto(
                log.getId(),
                log.getActorId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetails(),
                log.getOccurredAt());
    }
}
