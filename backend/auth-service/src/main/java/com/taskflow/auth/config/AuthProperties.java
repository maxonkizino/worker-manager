package com.taskflow.auth.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.auth")
public record AuthProperties(LockProperties lock, RefreshCookieProperties refreshCookie) {

    public record LockProperties(int maxAttempts, Duration duration) {
    }

    public record RefreshCookieProperties(
            String name,
            String path,
            boolean secure,
            String sameSite,
            Duration maxAge) {
    }
}
