package com.taskflow.auth.service;

import com.taskflow.auth.domain.AppRole;
import com.taskflow.auth.domain.User;
import com.taskflow.auth.domain.UserStatus;
import com.taskflow.auth.dto.UpdateRolesRequest;
import com.taskflow.auth.dto.UserResponse;
import com.taskflow.auth.outbox.OutboxService;
import com.taskflow.auth.repository.UserRepository;
import com.taskflow.auth.web.error.AuthException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final OutboxService outboxService;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserAdminService::toResponse).toList();
    }

    @Transactional
    public UserResponse updateRoles(UUID id, UpdateRolesRequest request) {
        User user = findUser(id);
        if (request.roles().isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "At least one role is required");
        }
        for (String role : request.roles()) {
            if (!AppRole.isValid(role)) {
                throw new AuthException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
            }
        }
        user.getRoles().clear();
        user.getRoles().addAll(request.roles());
        userRepository.save(user);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getId().toString());
        payload.put("roles", List.copyOf(user.getRoles()));
        outboxService.enqueue("User", user.getId(), "user.roles-changed", payload);

        return toResponse(user);
    }

    @Transactional
    public UserResponse block(UUID id) {
        User user = findUser(id);
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        Map<String, Object> payload = Map.of("userId", user.getId().toString());
        outboxService.enqueue("User", user.getId(), "user.blocked", payload);
        return toResponse(user);
    }

    @Transactional
    public UserResponse unblock(UUID id) {
        User user = findUser(id);
        user.setStatus(UserStatus.ACTIVE);
        user.resetFailedLogins();
        userRepository.save(user);
        return toResponse(user);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus().name(),
                List.copyOf(user.getRoles()),
                user.getFailedLoginAttempts(),
                user.getLockedUntil(),
                user.getLastLoginAt(),
                user.getCreatedAt());
    }
}
