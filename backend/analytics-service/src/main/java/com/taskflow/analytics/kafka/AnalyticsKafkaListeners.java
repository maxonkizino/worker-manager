package com.taskflow.analytics.kafka;

import com.taskflow.analytics.service.EventIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "taskflow.kafka", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class AnalyticsKafkaListeners {

    private final EventIngestionService eventIngestionService;

    @KafkaListener(topics = "${taskflow.kafka.task-events-topic}")
    public void onTaskEvent(String payload) {
        eventIngestionService.ingestTaskEvent(payload);
    }

    @KafkaListener(topics = "${taskflow.kafka.timeentry-events-topic}")
    public void onTimeEntryEvent(String payload) {
        eventIngestionService.ingestTimeEntryEvent(payload);
    }

    @KafkaListener(topics = "${taskflow.kafka.absence-events-topic}")
    public void onAbsenceEvent(String payload) {
        eventIngestionService.ingestAbsenceEvent(payload);
    }
}
