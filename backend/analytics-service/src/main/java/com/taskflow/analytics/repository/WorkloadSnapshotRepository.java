package com.taskflow.analytics.repository;

import com.taskflow.analytics.domain.WorkloadSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkloadSnapshotRepository extends JpaRepository<WorkloadSnapshot, UUID> {

    @Query("""
            select w from WorkloadSnapshot w
            where w.snapshotDate >= :from and w.snapshotDate <= :to
            """)
    List<WorkloadSnapshot> findInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<WorkloadSnapshot> findByEmployeeIdAndSnapshotDateBetween(
            UUID employeeId, LocalDate from, LocalDate to);

    Optional<WorkloadSnapshot> findByEmployeeIdAndSnapshotDate(UUID employeeId, LocalDate snapshotDate);
}
