package com.taskflow.auth.service;

import com.taskflow.auth.config.AuthProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshCookieService {

    private final AuthProperties authProperties;

    public void setRefreshCookie(HttpServletResponse response, String rawRefreshToken) {
        AuthProperties.RefreshCookieProperties cookie = authProperties.refreshCookie();
        Duration maxAge = cookie.maxAge();
        ResponseCookie refreshCookie = ResponseCookie.from(cookie.name(), rawRefreshToken)
                .httpOnly(true)
                .secure(cookie.secure())
                .path(cookie.path())
                .sameSite(cookie.sameSite())
                .maxAge(maxAge)
                .build();
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        AuthProperties.RefreshCookieProperties cookie = authProperties.refreshCookie();
        ResponseCookie cleared = ResponseCookie.from(cookie.name(), "")
                .httpOnly(true)
                .secure(cookie.secure())
                .path(cookie.path())
                .sameSite(cookie.sameSite())
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cleared.toString());
    }

    public String readRefreshToken(Cookie[] cookies) {
        if (cookies == null) {
            return null;
        }
        String name = authProperties.refreshCookie().name();
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
