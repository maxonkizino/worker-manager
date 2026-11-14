package com.taskflow.user.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.user.domain.OutboxEvent;
import com.taskflow.user.repository.OutboxEventRepository;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public void enqueue(String aggregateType, UUID aggregateId, String eventType, Map<String, ?> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, json));
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Failed to serialize outbox payload", ex);
        }
    }
}
