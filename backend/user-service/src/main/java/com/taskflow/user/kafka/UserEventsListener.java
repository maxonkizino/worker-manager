package com.taskflow.user.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.user.service.EmployeeProvisioningService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "taskflow.kafka", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class UserEventsListener {

    private final EmployeeProvisioningService employeeProvisioningService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${taskflow.kafka.user-events-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "userEventsKafkaListenerContainerFactory")
    public void onUserCreated(String payload) throws Exception {
        JsonNode root = objectMapper.readTree(payload);
        String eventType = text(root, "eventType");
        if (eventType != null && !"user.created".equals(eventType)) {
            return;
        }
        JsonNode body = root.get("payload");
        if (body == null || !body.isObject()) {
            body = root;
        }
        String rawId = firstText(body, "userId", "id");
        if (rawId == null) {
            rawId = text(root, "aggregateId");
        }
        if (rawId == null) {
            log.warn("user.created without id: {}", payload);
            return;
        }
        UUID id = UUID.fromString(rawId);
        String fullName = text(body, "fullName");
        if (fullName == null) {
            fullName = ((text(body, "firstName") == null ? "" : text(body, "firstName"))
                            + " "
                            + (text(body, "lastName") == null ? "" : text(body, "lastName")))
                    .trim();
        }
        log.info("Received user.created for {}", id);
        employeeProvisioningService.ensure(id, text(body, "email"), fullName, text(body, "username"));
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = text(node, field);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }
}
