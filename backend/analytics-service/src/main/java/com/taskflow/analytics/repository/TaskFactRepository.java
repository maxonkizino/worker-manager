package com.taskflow.analytics.repository;

import com.taskflow.analytics.domain.TaskFact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskFactRepository extends JpaRepository<TaskFact, UUID> {

    @Query("""
            select t from TaskFact t
            where t.status not in ('DONE', 'CANCELLED')
              and (:projectId is null or t.projectId = :projectId)
              and (t.plannedEnd is null or (t.plannedEnd >= :from and t.plannedEnd <= :to))
            """)
    List<TaskFact> findActiveInRange(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("projectId") UUID projectId);

    List<TaskFact> findByAssigneeIdAndStatusNotIn(UUID assigneeId, List<String> terminalStatuses);

    @Query("""
            select t from TaskFact t
            where t.status not in ('DONE', 'CANCELLED')
              and t.plannedEnd is not null
              and t.plannedEnd >= :from
              and t.plannedEnd <= :to
            order by t.plannedEnd
            """)
    List<TaskFact> findDeadlineReport(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
