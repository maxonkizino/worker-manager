package com.taskflow.analytics.repository;

import com.taskflow.analytics.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findTop50ByOrderByOccurredAtDesc();
}
