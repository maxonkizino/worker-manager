package com.taskflow.user.repository;

import com.taskflow.user.domain.Absence;
import com.taskflow.user.domain.enums.AbsenceStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AbsenceRepository extends JpaRepository<Absence, UUID> {

    @Query("""
            select a from Absence a
            where a.employeeId = :employeeId
              and a.startDate <= :to
              and a.endDate >= :from
            """)
    List<Absence> findOverlapping(
            @Param("employeeId") UUID employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    List<Absence> findByEmployeeId(UUID employeeId);

    List<Absence> findByEmployeeIdAndStatus(UUID employeeId, AbsenceStatus status);
}
