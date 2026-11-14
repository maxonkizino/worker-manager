package com.taskflow.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "task_facts")
@Getter
@Setter
public class TaskFact {

    @Id
    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(nullable = false, length = 15)
    private String status;

    @Column(nullable = false, length = 10)
    private String priority;

    @Column(name = "planned_start")
    private LocalDate plannedStart;

    @Column(name = "planned_end")
    private LocalDate plannedEnd;

    @Column(name = "estimated_hours", nullable = false)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", nullable = false)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "source_updated_at")
    private Instant sourceUpdatedAt;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt = Instant.now();
}
