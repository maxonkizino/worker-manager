package com.taskflow.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.notification.domain.ProcessedEvent;
import com.taskflow.notification.repository.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskEventIngestionService {

    private static final Logger log = LoggerFactory.getLogger(TaskEventIngestionService.class);
    private static final String CONSUMER = "notification-service";

    private final ObjectMapper objectMapper;
    private final ProcessedEventRepository processedEventRepository;
    private final NotificationQueryService notificationQueryService;

    @Transactional
    public void ingest(String payload) {
        JsonNode root = parse(payload);
        if (root == null) {
            return;
        }
        UUID eventId = uuid(root, "eventId");
        if (eventId != null && processedEventRepository.existsById(eventId)) {
            return;
        }
        String eventType = Optional.ofNullable(text(root, "eventType")).orElse("");
        if (!"task.assigned".equals(eventType)) {
            return;
        }
        JsonNode body = root.path("payload");
        if (body.isMissingNode()) {
            body = root;
        }
        UUID assigneeId = uuid(body, "assigneeId");
        if (assigneeId == null) {
            assigneeId = uuid(body, "employeeId");
        }
        UUID taskId = uuid(body, "taskId");
        if (assigneeId == null || taskId == null) {
            return;
        }
        Map<String, Object> payloadMap = new HashMap<>();
        body.fields().forEachRemaining(f -> payloadMap.put(f.getKey(), f.getValue().asText()));
        String title = body.path("title").asText("New task assignment");
        String taskTitle = body.path("taskTitle").asText(title);
        notificationQueryService.createAssignment(
                assigneeId,
                "Task assigned",
                "You were assigned to task: " + taskTitle,
                payloadMap);

        if (eventId != null) {
            ProcessedEvent processed = new ProcessedEvent();
            processed.setEventId(eventId);
            processed.setEventType(eventType);
            processed.setConsumerName(CONSUMER);
            processedEventRepository.save(processed);
        }
    }

    private JsonNode parse(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception ex) {
            log.warn("Failed to parse task event: {}", ex.getMessage());
            return null;
        }
    }

    private static String text(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText(null) : null;
    }

    private static UUID uuid(JsonNode node, String field) {
        if (!node.hasNonNull(field)) {
            return null;
        }
        try {
            return UUID.fromString(node.get(field).asText());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
