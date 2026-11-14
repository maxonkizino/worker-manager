package com.taskflow.analytics.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

public final class RequestUserIds {

    private RequestUserIds() {
    }

    public static UUID requireUserId(HttpServletRequest request) {
        Object attr = request.getAttribute(UserHeaderFilter.REQUEST_USER_ID);
        if (attr instanceof UUID userId) {
            return userId;
        }
        throw new ResponseStatusException(BAD_REQUEST, "Missing or invalid " + UserHeaderFilter.USER_ID_HEADER);
    }

    public static void requireAnyRole(HttpServletRequest request, String... roles) {
        String raw = request.getHeader(UserHeaderFilter.USER_ROLES_HEADER);
        if (raw == null || raw.isBlank()) {
            throw new ResponseStatusException(FORBIDDEN, "Недостаточно прав");
        }
        boolean allowed = Arrays.stream(raw.split(","))
                .map(String::trim)
                .anyMatch(role -> Arrays.stream(roles).anyMatch(expected -> role.equals(expected) || role.equals("ROLE_" + expected)));
        if (!allowed) {
            throw new ResponseStatusException(FORBIDDEN, "Недостаточно прав");
        }
    }
}
