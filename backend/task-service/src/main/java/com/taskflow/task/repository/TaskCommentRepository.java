package com.taskflow.task.repository;

import com.taskflow.task.domain.TaskComment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {

    List<TaskComment> findByTaskIdOrderByCreatedAtAsc(UUID taskId);
}
