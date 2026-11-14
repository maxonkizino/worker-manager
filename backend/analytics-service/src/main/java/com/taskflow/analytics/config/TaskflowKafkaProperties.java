package com.taskflow.analytics.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.kafka")
public record TaskflowKafkaProperties(
        boolean enabled,
        String taskEventsTopic,
        String timeentryEventsTopic,
        String absenceEventsTopic) {
}
