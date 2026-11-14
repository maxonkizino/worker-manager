package com.taskflow.analytics;

import com.taskflow.analytics.config.TaskflowKafkaProperties;
import com.taskflow.analytics.config.TaskflowUserServiceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = KafkaAutoConfiguration.class)
@EnableConfigurationProperties({TaskflowKafkaProperties.class, TaskflowUserServiceProperties.class})
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
