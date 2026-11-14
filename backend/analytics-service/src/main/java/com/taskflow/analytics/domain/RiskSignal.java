package com.taskflow.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "risk_signals")
@Getter
@Setter
public class RiskSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "task_id")
    private UUID taskId;

    @Column(nullable = false, length = 10)
    private String kind;

    @Column(nullable = false, length = 10)
    private String status = "ACTIVE";

    @Column(name = "detected_date", nullable = false)
    private LocalDate detectedDate = LocalDate.now();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> details = Map.of();

    @Column(name = "cleared_at")
    private Instant clearedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
