package com.taskflow.analytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.analytics.domain.ProcessedEvent;
import com.taskflow.analytics.domain.TaskFact;
import com.taskflow.analytics.domain.TimeEntryFact;
import com.taskflow.analytics.repository.ProcessedEventRepository;
import com.taskflow.analytics.repository.TaskFactRepository;
import com.taskflow.analytics.repository.TimeEntryFactRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventIngestionService {

    private static final Logger log = LoggerFactory.getLogger(EventIngestionService.class);
    private static final String CONSUMER = "analytics-service";

    private final ObjectMapper objectMapper;
    private final ProcessedEventRepository processedEventRepository;
    private final TaskFactRepository taskFactRepository;
    private final TimeEntryFactRepository timeEntryFactRepository;
    private final AuditService auditService;
    private final WorkloadService workloadService;

    @Transactional
    public void ingestTaskEvent(String payload) {
        JsonNode root = parse(payload);
        if (root == null || isDuplicate(root)) {
            return;
        }
        String eventType = text(root, "eventType");
        JsonNode body = root.path("payload");
        if (body.isMissingNode()) {
            body = root;
        }
        switch (Optional.ofNullable(eventType).orElse("")) {
            case "task.created", "task.updated", "task.status-changed", "task.assigned", "task.unassigned" ->
                    upsertTaskFact(body, eventType);
            default -> log.debug("Ignoring unsupported task event {}", eventType);
        }
        markProcessed(root, eventType);
    }

    @Transactional
    public void ingestTimeEntryEvent(String payload) {
        JsonNode root = parse(payload);
        if (root == null || isDuplicate(root)) {
            return;
        }
        String eventType = text(root, "eventType");
        JsonNode body = root.path("payload");
        if (body.isMissingNode()) {
            body = root;
        }
        if ("timeentry.added".equals(eventType)
                || "timeentry.created".equals(eventType)
                || "time-entry.created".equals(eventType)) {
            upsertTimeEntry(body);
        }
        markProcessed(root, eventType);
    }

    @Transactional
    public void ingestAbsenceEvent(String payload) {
        JsonNode root = parse(payload);
        if (root == null || isDuplicate(root)) {
            return;
        }
        String eventType = text(root, "eventType");
        JsonNode body = root.path("payload");
        if (body.isMissingNode()) {
            body = root;
        }
        Map<String, Object> details = new HashMap<>();
        body.fields().forEachRemaining(f -> details.put(f.getKey(), jsonValue(f.getValue())));
        auditService.record(
                uuid(body, "actorId"),
                "absence.decided",
                "absence",
                uuid(body, "absenceId"),
                details);
        UUID employeeId = uuid(body, "employeeId");
        if (employeeId != null) {
            workloadService.recalculateForEmployee(employeeId, LocalDate.now());
        }
        markProcessed(root, eventType);
    }

    private void upsertTaskFact(JsonNode body, String eventType) {
        UUID taskId = uuid(body, "taskId");
        if (taskId == null) {
            taskId = uuid(body, "id");
        }
        if (taskId == null) {
            return;
        }
        TaskFact fact = taskFactRepository.findById(taskId).orElseGet(TaskFact::new);
        fact.setTaskId(taskId);
        if (body.hasNonNull("projectId")) {
            fact.setProjectId(UUID.fromString(body.get("projectId").asText()));
        } else if (fact.getProjectId() == null) {
            fact.setProjectId(taskId);
        }
        if (body.has("projectName")) {
            fact.setProjectName(body.get("projectName").asText(null));
        }
        String assignee = firstText(body, "assigneeId", "employeeId");
        if (assignee != null) {
            fact.setAssigneeId(UUID.fromString(assignee));
        }
        if (body.has("status")) {
            fact.setStatus(body.get("status").asText("ASSIGNED"));
        } else if (body.has("to")) {
            fact.setStatus(body.get("to").asText("ASSIGNED"));
        } else if (fact.getStatus() == null) {
            fact.setStatus("ASSIGNED");
        }
        if (body.has("priority")) {
            fact.setPriority(body.get("priority").asText("MEDIUM"));
        } else if (fact.getPriority() == null) {
            fact.setPriority("MEDIUM");
        }
        if (body.has("plannedStart")) {
            fact.setPlannedStart(LocalDate.parse(body.get("plannedStart").asText()));
        }
        if (body.has("plannedEnd")) {
            fact.setPlannedEnd(LocalDate.parse(body.get("plannedEnd").asText()));
        }
        if (body.has("estimatedHours")) {
            fact.setEstimatedHours(body.get("estimatedHours").decimalValue());
        } else if (fact.getEstimatedHours() == null) {
            fact.setEstimatedHours(BigDecimal.ONE);
        }
        if (body.has("actualHours")) {
            fact.setActualHours(body.get("actualHours").decimalValue());
        }
        fact.setSourceUpdatedAt(Instant.now());
        taskFactRepository.save(fact);

        Map<String, Object> details = Map.of("eventType", eventType);
        auditService.record(uuid(body, "actorId"), eventType, "task", taskId, details);
        if (fact.getAssigneeId() != null) {
            workloadService.recalculateForEmployee(fact.getAssigneeId(), LocalDate.now());
        }
    }

    private void upsertTimeEntry(JsonNode body) {
        UUID entryId = uuid(body, "timeEntryId");
        if (entryId == null) {
            entryId = uuid(body, "id");
        }
        if (entryId == null) {
            return;
        }
        TimeEntryFact fact = timeEntryFactRepository.findById(entryId).orElseGet(TimeEntryFact::new);
        fact.setSourceEntryId(entryId);
        fact.setTaskId(requireUuid(body, "taskId"));
        fact.setProjectId(Optional.ofNullable(uuid(body, "projectId")).orElse(fact.getTaskId()));
        fact.setEmployeeId(requireUuid(body, "employeeId"));
        fact.setWorkDate(LocalDate.parse(body.path("workDate").asText(LocalDate.now().toString())));
        JsonNode hoursNode = body.path("hours");
        fact.setHours(hoursNode.isNumber() ? hoursNode.decimalValue() : BigDecimal.ONE);
        timeEntryFactRepository.save(fact);

        auditService.record(
                uuid(body, "actorId"),
                "timeentry.added",
                "time_entry",
                entryId,
                Map.of("taskId", fact.getTaskId().toString(), "hours", fact.getHours()));
        workloadService.recalculateForEmployee(fact.getEmployeeId(), fact.getWorkDate());
    }

    private boolean isDuplicate(JsonNode root) {
        UUID eventId = uuid(root, "eventId");
        if (eventId == null) {
            return false;
        }
        return processedEventRepository.existsById(eventId);
    }

    private void markProcessed(JsonNode root, String eventType) {
        UUID eventId = uuid(root, "eventId");
        if (eventId == null) {
            return;
        }
        ProcessedEvent processed = new ProcessedEvent();
        processed.setEventId(eventId);
        processed.setEventType(eventType == null ? "unknown" : eventType);
        processed.setConsumerName(CONSUMER);
        processedEventRepository.save(processed);
    }

    private JsonNode parse(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception ex) {
            log.warn("Failed to parse event payload: {}", ex.getMessage());
            return null;
        }
    }

    private static String text(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText(null) : null;
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = text(node, field);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
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

    private static UUID requireUuid(JsonNode node, String field) {
        UUID value = uuid(node, field);
        if (value == null) {
            throw new IllegalArgumentException("Missing " + field);
        }
        return value;
    }

    private static Object jsonValue(JsonNode node) {
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isNumber()) {
            return node.numberValue();
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        return node.toString();
    }
}
