package com.taskflow.analytics.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.user-service")
public record TaskflowUserServiceProperties(String baseUrl) {
}
