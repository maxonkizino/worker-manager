package com.taskflow.user.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.jwt")
public record TaskflowJwtProperties(String secret) {
}
