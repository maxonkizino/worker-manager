package com.taskflow.auth.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.auth.domain.OutboxEvent;
import com.taskflow.auth.repository.OutboxEventRepository;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void enqueue(String aggregateType, UUID aggregateId, String eventType, Map<String, Object> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, json));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize outbox payload", e);
        }
    }
}
