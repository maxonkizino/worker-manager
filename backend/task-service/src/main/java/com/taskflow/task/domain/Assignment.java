package com.taskflow.task.domain;

import com.taskflow.task.domain.enums.AssignmentSource;
import com.taskflow.task.domain.enums.AssignmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "assignments")
@Getter
@Setter
public class Assignment {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Column(name = "proposal_id")
    private UUID proposalId;

    @Column(name = "planned_hours", nullable = false, precision = 8, scale = 2)
    private BigDecimal plannedHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AssignmentSource source = AssignmentSource.MANUAL;

    @Column(name = "assigned_at", nullable = false, insertable = false, updatable = false)
    private Instant assignedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;
}
