package com.taskflow.user.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.user.config.TaskflowKafkaProperties;
import com.taskflow.user.domain.OutboxEvent;
import com.taskflow.user.repository.OutboxEventRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AbsenceOutboxPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final TaskflowKafkaProperties kafkaProperties;
    private final ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "5000")
    @Transactional
    public void publishPending() {
        List<OutboxEvent> batch = outboxEventRepository.findUnpublished();
        if (batch.isEmpty()) {
            return;
        }
        for (OutboxEvent event : batch) {
            try {
                KafkaTemplate<String, String> kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
                if (kafkaProperties.enabled() && kafkaTemplate != null) {
                    kafkaTemplate.send(
                            kafkaProperties.absenceEventsTopic(),
                            event.getAggregateId().toString(),
                            buildEnvelope(event));
                    event.setPublishedAt(Instant.now());
                    event.setLastError(null);
                } else {
                    log.info(
                            "Kafka disabled — outbox event {} ({}) stays unpublished",
                            event.getId(),
                            event.getEventType());
                }
            } catch (Exception ex) {
                event.setAttempts(event.getAttempts() + 1);
                String message = ex.getMessage();
                if (message != null && message.length() > 2000) {
                    message = message.substring(0, 2000);
                }
                event.setLastError(message);
                log.warn("Failed to publish outbox event {}: {}", event.getId(), ex.getMessage());
            }
        }
    }

    private String buildEnvelope(OutboxEvent event) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("eventId", event.getId().toString());
        root.put("eventType", event.getEventType());
        root.put("occurredAt", event.getOccurredAt().toString());
        root.put("aggregateType", event.getAggregateType());
        root.put("aggregateId", event.getAggregateId().toString());
        root.set("payload", objectMapper.readTree(event.getPayload()));
        return objectMapper.writeValueAsString(root);
    }
}
