package com.taskflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.redis")
public record TaskflowRedisProperties(boolean enabled) {
}
