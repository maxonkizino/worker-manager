package com.taskflow.optimization.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.services")
@Getter
@Setter
public class TaskflowServiceProperties {

    private String taskServiceUrl = "http://localhost:8083";
    private String userServiceUrl = "http://localhost:8082";
    private Duration httpConnectTimeout = Duration.ofSeconds(5);
    private Duration httpReadTimeout = Duration.ofSeconds(10);
}
