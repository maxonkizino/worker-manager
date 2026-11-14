package com.taskflow.analytics.repository;

import com.taskflow.analytics.domain.TimeEntryFact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface TimeEntryFactRepository extends JpaRepository<TimeEntryFact, UUID> {

    @Query("""
            select coalesce(sum(e.hours), 0) from TimeEntryFact e
            where e.employeeId = :employeeId
              and e.workDate >= :from and e.workDate <= :to
            """)
    BigDecimal sumHoursForEmployee(
            @Param("employeeId") UUID employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
