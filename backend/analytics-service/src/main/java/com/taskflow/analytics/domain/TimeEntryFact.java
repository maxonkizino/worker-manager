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
@Table(name = "time_entry_facts")
@Getter
@Setter
public class TimeEntryFact {

    @Id
    @Column(name = "source_entry_id")
    private UUID sourceEntryId;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(nullable = false)
    private BigDecimal hours;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt = Instant.now();
}
