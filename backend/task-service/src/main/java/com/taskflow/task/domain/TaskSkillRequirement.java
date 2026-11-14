package com.taskflow.task.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "task_skill_requirements")
@Getter
@Setter
public class TaskSkillRequirement {

    @EmbeddedId
    private TaskSkillRequirementId id;

    @Column(name = "min_level", nullable = false)
    private short minLevel;
}
