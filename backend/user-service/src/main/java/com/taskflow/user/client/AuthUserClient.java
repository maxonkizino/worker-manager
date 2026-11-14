package com.taskflow.user.client;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class AuthUserClient {

    private final RestClient restClient;

    public AuthUserClient(@Value("${taskflow.auth-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public AuthUser get(UUID id) {
        return restClient.get().uri("/internal/users/{id}", id).retrieve().body(AuthUser.class);
    }

    public record AuthUser(UUID id, String username, String email, String fullName) {}
}
