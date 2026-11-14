package com.taskflow.task.repository;

import com.taskflow.task.domain.ProjectMember;
import com.taskflow.task.domain.ProjectMemberId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {

    List<ProjectMember> findByIdProjectId(UUID projectId);

    List<ProjectMember> findById_EmployeeId(UUID employeeId);

    boolean existsByIdProjectIdAndIdEmployeeId(UUID projectId, UUID employeeId);
}
