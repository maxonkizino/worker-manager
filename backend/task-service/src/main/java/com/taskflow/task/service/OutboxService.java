package com.taskflow.task.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.task.domain.OutboxEvent;
import com.taskflow.task.repository.OutboxEventRepository;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OutboxService {

  private final OutboxEventRepository outboxEventRepository;
  private final ObjectMapper objectMapper;

  public void publish(String aggregateType, UUID aggregateId, String eventType, Map<String, ?> payload) {
    try {
      String json = objectMapper.writeValueAsString(payload);
      outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, json));
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize outbox payload", e);
    }
  }
}
