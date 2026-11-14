package com.taskflow.auth.web;

import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.LoginResponse;
import com.taskflow.auth.dto.RegisterRequest;
import com.taskflow.auth.dto.RegisterResponse;
import com.taskflow.auth.service.AuthService;
import com.taskflow.auth.service.RefreshCookieService;
import com.taskflow.auth.web.error.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieService refreshCookieService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AuthService.LoginResult result =
                authService.login(request, httpRequest.getHeader(HttpHeaders.USER_AGENT), clientIp(httpRequest));
        refreshCookieService.setRefreshCookie(httpResponse, result.refreshTokenRaw());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String raw = refreshCookieService.readRefreshToken(httpRequest.getCookies());
        if (raw == null || raw.isBlank()) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Refresh token missing");
        }
        AuthService.LoginResult result =
                authService.refresh(raw, httpRequest.getHeader(HttpHeaders.USER_AGENT), clientIp(httpRequest));
        refreshCookieService.setRefreshCookie(httpResponse, result.refreshTokenRaw());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String raw = refreshCookieService.readRefreshToken(httpRequest.getCookies());
        authService.logout(raw, httpRequest.getHeader(HttpHeaders.AUTHORIZATION));
        refreshCookieService.clearRefreshCookie(httpResponse);
        return ResponseEntity.noContent().build();
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
