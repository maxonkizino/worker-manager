package com.taskflow.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "workload_snapshots")
@Getter
@Setter
public class WorkloadSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "capacity_hours", nullable = false)
    private BigDecimal capacityHours;

    @Column(name = "planned_hours", nullable = false)
    private BigDecimal plannedHours = BigDecimal.ZERO;

    @Column(name = "actual_hours", nullable = false)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column
    private BigDecimal utilization;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
