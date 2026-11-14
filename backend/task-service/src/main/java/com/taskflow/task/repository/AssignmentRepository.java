package com.taskflow.task.repository;

import com.taskflow.task.domain.Assignment;
import com.taskflow.task.domain.enums.AssignmentStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    Optional<Assignment> findByTaskIdAndStatus(UUID taskId, AssignmentStatus status);

    List<Assignment> findByEmployeeIdAndStatus(UUID employeeId, AssignmentStatus status);

    List<Assignment> findByTaskIdInAndStatus(Collection<UUID> taskIds, AssignmentStatus status);

    List<Assignment> findByTaskId(UUID taskId);
}
