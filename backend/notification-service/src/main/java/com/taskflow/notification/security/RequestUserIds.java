package com.taskflow.notification.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

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
}
