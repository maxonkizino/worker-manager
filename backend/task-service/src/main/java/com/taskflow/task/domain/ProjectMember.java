package com.taskflow.task.domain;

import com.taskflow.task.domain.enums.ProjectRole;
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
@Table(name = "project_members")
@Getter
@Setter
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_role", nullable = false, length = 20)
    private ProjectRole projectRole = ProjectRole.MEMBER;

    @Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
    private Instant joinedAt;
}
