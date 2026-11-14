package com.taskflow.analytics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "employee_snapshots")
@Getter
@Setter
public class EmployeeSnapshot {

    @Id
    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "department_name")
    private String departmentName;

    @Column(name = "position")
    private String position;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt = Instant.now();
}
