package com.taskflow.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.kafka")
public record TaskflowKafkaProperties(boolean enabled, String taskEventsTopic) {
}
