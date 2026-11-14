package com.taskflow.notification.kafka;

import com.taskflow.notification.service.TaskEventIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "taskflow.kafka", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class NotificationKafkaListeners {

    private final TaskEventIngestionService taskEventIngestionService;

    @KafkaListener(topics = "${taskflow.kafka.task-events-topic}")
    public void onTaskEvent(String payload) {
        taskEventIngestionService.ingest(payload);
    }
}
