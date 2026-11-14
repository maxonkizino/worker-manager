package com.taskflow.user.repository;

import com.taskflow.user.domain.EmployeeAvatar;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployeeAvatarRepository extends JpaRepository<EmployeeAvatar, UUID> {

    @Query("select a.employeeId from EmployeeAvatar a")
    List<UUID> findAllEmployeeIds();
}
