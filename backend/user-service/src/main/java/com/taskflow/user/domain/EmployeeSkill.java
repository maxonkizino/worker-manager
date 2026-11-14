package com.taskflow.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_skills")
@IdClass(EmployeeSkill.EmployeeSkillId.class)
@Getter
@Setter
public class EmployeeSkill {

    @Id
    @Column(name = "employee_id")
    private UUID employeeId;

    @Id
    @Column(name = "skill_id")
    private UUID skillId;

    @Column(nullable = false)
    private Short level;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class EmployeeSkillId implements Serializable {
        private UUID employeeId;
        private UUID skillId;
    }
}
