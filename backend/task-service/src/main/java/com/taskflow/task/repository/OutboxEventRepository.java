package com.taskflow.task.repository;

import com.taskflow.task.domain.OutboxEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

  @Query("""
      select e from OutboxEvent e
      where e.publishedAt is null
      order by e.occurredAt asc
      """)
  List<OutboxEvent> findUnpublished();
}
