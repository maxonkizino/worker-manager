package com.taskflow.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.taskflow.auth.domain.AppRole;
import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.RegisterRequest;
import com.taskflow.auth.repository.OutboxEventRepository;
import com.taskflow.auth.repository.UserRepository;
import com.taskflow.auth.support.PostgresContainerSupport;
import com.taskflow.auth.web.error.AuthException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceIntegrationTest extends PostgresContainerSupport {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Test
    @Transactional
    void registerCreatesEmployeeAndOutboxEvent() {
        authService.register(new RegisterRequest("ivan", "ivan@example.com", "password1", "Ivan Ivanov"));

        var user = userRepository.findByUsernameIgnoreCase("ivan").orElseThrow();
        assertThat(user.getRoles()).containsExactly(AppRole.ROLE_EMPLOYEE.name());

        var events = outboxEventRepository.findUnpublished();
        assertThat(events).hasSize(1);
        assertThat(events.getFirst().getEventType()).isEqualTo("user.created");
        assertThat(events.getFirst().getPayload()).contains("fullName");
    }

    @Test
    @Transactional
    void loginFailsWithWrongPasswordAndLocksAfterRepeatedFailures() {
        authService.register(new RegisterRequest("petr", "petr@example.com", "password1", "Petr Petrov"));

        for (int i = 0; i < 5; i++) {
            try {
                authService.login(new LoginRequest("petr", "wrong"), "JUnit", "127.0.0.1");
            } catch (AuthException ignored) {
            }
        }

        var user = userRepository.findByUsernameIgnoreCase("petr").orElseThrow();
        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();

        assertThatThrownBy(() -> authService.login(new LoginRequest("petr", "password1"), "JUnit", "127.0.0.1"))
                .isInstanceOf(AuthException.class);
    }
}
