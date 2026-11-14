package com.taskflow.auth.service;

import com.taskflow.auth.config.AuthProperties;
import com.taskflow.auth.domain.AppRole;
import com.taskflow.auth.domain.User;
import com.taskflow.auth.domain.UserStatus;
import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.LoginResponse;
import com.taskflow.auth.dto.RegisterRequest;
import com.taskflow.auth.dto.RegisterResponse;
import com.taskflow.auth.outbox.OutboxService;
import com.taskflow.auth.repository.UserRepository;
import com.taskflow.auth.security.JwtService;
import com.taskflow.auth.web.error.AuthException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthProperties authProperties;
    private final OutboxService outboxService;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new AuthException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new AuthException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User(request.username().trim(), request.email().trim().toLowerCase(), passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.getRoles().add(AppRole.ROLE_EMPLOYEE.name());
        userRepository.save(user);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getId().toString());
        payload.put("username", user.getUsername());
        payload.put("email", user.getEmail());
        payload.put("fullName", request.fullName());
        payload.put("roles", List.copyOf(user.getRoles()));
        outboxService.enqueue("User", user.getId(), "user.created", payload);

        return new RegisterResponse(user.getId(), user.getUsername(), user.getEmail());
    }

    @Transactional
    public LoginResult login(LoginRequest request, String userAgent, String ipAddress) {
        User user = userRepository
                .findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        Instant now = Instant.now();
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Account is blocked");
        }
        if (user.isLocked(now)) {
            throw new AuthException(HttpStatus.LOCKED, "Account is temporarily locked");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int max = authProperties.lock().maxAttempts();
            Instant lockUntil = now.plus(authProperties.lock().duration());
            user.registerFailedLogin(max, lockUntil);
            userRepository.save(user);
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.resetFailedLogins();
        user.setLastLoginAt(now);
        userRepository.save(user);

        List<String> roles = new ArrayList<>(user.getRoles());
        JwtService.IssuedAccessToken access = jwtService.issueAccessToken(user.getId(), user.getUsername(), roles);
        RefreshTokenService.IssuedRefreshToken refresh = refreshTokenService.create(user, userAgent, ipAddress);

        LoginResponse body = new LoginResponse(
                access.token(),
                "Bearer",
                access.expiresInSeconds(),
                user.getId(),
                user.getUsername(),
                roles);
        return new LoginResult(body, refresh.raw());
    }

    @Transactional
    public LoginResult refresh(String rawRefreshToken, String userAgent, String ipAddress) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotate(rawRefreshToken, userAgent, ipAddress);
        User user = rotation.user();
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Account is blocked");
        }
        List<String> roles = new ArrayList<>(user.getRoles());
        JwtService.IssuedAccessToken access = jwtService.issueAccessToken(user.getId(), user.getUsername(), roles);
        LoginResponse body = new LoginResponse(
                access.token(),
                "Bearer",
                access.expiresInSeconds(),
                user.getId(),
                user.getUsername(),
                roles);
        return new LoginResult(body, rotation.rawRefreshToken());
    }

    public void logout(String rawRefreshToken, String accessTokenHeader) {
        refreshTokenService.revokeByRawToken(rawRefreshToken);
        if (accessTokenHeader != null && accessTokenHeader.startsWith("Bearer ")) {
            try {
                JwtService.ParsedAccessToken parsed = jwtService.parse(accessTokenHeader.substring(7));
                tokenBlacklistService.blacklist(parsed.jti(), parsed.expiresAt());
            } catch (Exception ignored) {
                // ignore invalid access token on logout
            }
        }
    }

    public record LoginResult(LoginResponse response, String refreshTokenRaw) {
    }
}
