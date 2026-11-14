package com.taskflow.auth;

import com.taskflow.auth.config.AuthProperties;
import com.taskflow.auth.config.JwtProperties;
import com.taskflow.auth.config.TaskflowKafkaProperties;
import com.taskflow.auth.config.TaskflowRedisProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({
        JwtProperties.class,
        AuthProperties.class,
        TaskflowKafkaProperties.class,
        TaskflowRedisProperties.class
})
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
