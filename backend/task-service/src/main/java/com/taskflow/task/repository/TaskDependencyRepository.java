package com.taskflow.task.repository;

import com.taskflow.task.domain.TaskDependency;
import com.taskflow.task.domain.TaskDependencyId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskDependencyRepository extends JpaRepository<TaskDependency, TaskDependencyId> {

    List<TaskDependency> findByIdTaskId(UUID taskId);

    @Query("SELECT d.id.dependsOnTaskId FROM TaskDependency d WHERE d.id.taskId = :taskId")
    List<UUID> findDependsOnIds(@Param("taskId") UUID taskId);

    @Query("""
            SELECT d.id.dependsOnTaskId FROM TaskDependency d
            WHERE d.id.taskId IN :taskIds
            """)
    List<UUID> findDependsOnIdsForTasks(@Param("taskIds") List<UUID> taskIds);
}
