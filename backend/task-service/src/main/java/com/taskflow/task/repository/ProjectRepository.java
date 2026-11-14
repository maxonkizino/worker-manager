package com.taskflow.task.repository;

import com.taskflow.task.domain.Project;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p.version FROM Project p WHERE p.id = :projectId")
    long findDataVersion(@Param("projectId") UUID projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE projects SET version = version + 1 WHERE id = :projectId", nativeQuery = true)
    int incrementDataVersion(@Param("projectId") UUID projectId);
}
