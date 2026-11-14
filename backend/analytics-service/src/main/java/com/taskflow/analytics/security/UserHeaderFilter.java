package com.taskflow.analytics.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class UserHeaderFilter extends OncePerRequestFilter {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_ROLES_HEADER = "X-User-Roles";
    public static final String REQUEST_USER_ID = "taskflow.userId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String raw = request.getHeader(USER_ID_HEADER);
        if (raw != null && !raw.isBlank()) {
            try {
                request.setAttribute(REQUEST_USER_ID, UUID.fromString(raw.trim()));
            } catch (IllegalArgumentException ignored) {
                // invalid header ignored; endpoints validate as needed
            }
        }
        filterChain.doFilter(request, response);
    }
}
