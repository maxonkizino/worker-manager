package com.taskflow.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.taskflow.auth.config.JwtProperties;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    @Test
    void issuesAndParsesAccessTokenWithRolesAndJti() {
        JwtService jwtService = new JwtService(
                new JwtProperties("test-jwt-secret-key-minimum-32-characters-long", Duration.ofMinutes(15), Duration.ofDays(7)));
        UUID userId = UUID.randomUUID();

        JwtService.IssuedAccessToken issued =
                jwtService.issueAccessToken(userId, "alice", List.of("ROLE_EMPLOYEE"));

        JwtService.ParsedAccessToken parsed = jwtService.parse(issued.token());

        assertThat(parsed.userId()).isEqualTo(userId);
        assertThat(parsed.username()).isEqualTo("alice");
        assertThat(parsed.roles()).containsExactly("ROLE_EMPLOYEE");
        assertThat(parsed.jti()).isNotBlank();
        assertThat(issued.expiresInSeconds()).isEqualTo(900);
    }
}
