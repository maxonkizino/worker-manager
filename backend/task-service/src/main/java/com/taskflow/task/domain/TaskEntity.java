package com.taskflow.task.domain;

import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "tasks")
@Getter
@Setter
public class TaskEntity {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private TaskStatus status = TaskStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "planned_start")
    private LocalDate plannedStart;

    @Column(name = "planned_end")
    private LocalDate plannedEnd;

    @Column(name = "estimated_hours", nullable = false, precision = 8, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", nullable = false, precision = 8, scale = 2)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;
}
