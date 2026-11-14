package com.taskflow.user.repository;

import com.taskflow.user.domain.EmployeeSkill;
import com.taskflow.user.domain.EmployeeSkill.EmployeeSkillId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, EmployeeSkillId> {

    List<EmployeeSkill> findByEmployeeId(UUID employeeId);

    void deleteByEmployeeId(UUID employeeId);
}
