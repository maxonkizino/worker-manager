package com.taskflow.task.repository;

import com.taskflow.task.domain.TaskEntity;
import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID>, JpaSpecificationExecutor<TaskEntity> {

    List<TaskEntity> findByProjectId(UUID projectId);

    @Query("""
            SELECT t FROM TaskEntity t
            WHERE t.projectId = :projectId
              AND (:status IS NULL OR t.status = :status)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:search IS NULL OR lower(t.title) LIKE lower(concat('%', :search, '%')))
            ORDER BY t.plannedStart NULLS LAST, t.priority DESC
            """)
    List<TaskEntity> findFiltered(
            @Param("projectId") UUID projectId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("search") String search);
}
