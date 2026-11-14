package com.taskflow.task.repository;

import com.taskflow.task.domain.TimeEntry;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM TimeEntry t WHERE t.taskId = :taskId")
    BigDecimal sumHoursByTaskId(@Param("taskId") UUID taskId);
}
