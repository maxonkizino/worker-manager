package com.taskflow.task.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "taskflow.kafka")
public record TaskflowKafkaProperties(
    boolean enabled,
    @DefaultValue("task.events") String taskEventsTopic,
    @DefaultValue("timeentry.events") String timeentryEventsTopic) {}
