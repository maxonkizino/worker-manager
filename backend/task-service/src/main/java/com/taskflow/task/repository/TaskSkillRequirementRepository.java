package com.taskflow.task.repository;

import com.taskflow.task.domain.TaskSkillRequirement;
import com.taskflow.task.domain.TaskSkillRequirementId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskSkillRequirementRepository extends JpaRepository<TaskSkillRequirement, TaskSkillRequirementId> {

    List<TaskSkillRequirement> findByIdTaskId(UUID taskId);

    List<TaskSkillRequirement> findByIdTaskIdIn(List<UUID> taskIds);
}
