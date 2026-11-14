package com.taskflow.task.domain;

import com.taskflow.task.domain.enums.DependencyType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "task_dependencies")
@Getter
@Setter
public class TaskDependency {

    @EmbeddedId
    private TaskDependencyId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "dependency_type", nullable = false, length = 20)
    private DependencyType dependencyType = DependencyType.FINISH_TO_START;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;
}
