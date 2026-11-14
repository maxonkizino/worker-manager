package com.taskflow.user.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "taskflow.kafka")
public record TaskflowKafkaProperties(
        boolean enabled,
        String userEventsTopic,
        @DefaultValue("absence.events") String absenceEventsTopic) {
}
