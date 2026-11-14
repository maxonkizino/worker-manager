package com.taskflow.user.repository;

import com.taskflow.user.domain.Department;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
