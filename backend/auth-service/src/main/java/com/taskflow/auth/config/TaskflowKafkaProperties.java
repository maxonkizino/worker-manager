package com.taskflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.kafka")
public record TaskflowKafkaProperties(boolean enabled, String userEventsTopic) {
}
