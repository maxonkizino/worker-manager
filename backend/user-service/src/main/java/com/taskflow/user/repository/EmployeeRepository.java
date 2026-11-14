package com.taskflow.user.repository;

import com.taskflow.user.domain.Employee;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
}
