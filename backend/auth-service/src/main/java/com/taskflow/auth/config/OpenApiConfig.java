package com.taskflow.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI authOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("TaskFlow Auth Service")
                        .description("Authentication and user management API")
                        .version("1.0"));
    }
}
