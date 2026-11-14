package com.taskflow.optimization.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class HeaderAuthFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_ROLES = "X-User-Roles";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String userIdHeader = request.getHeader(HEADER_USER_ID);
        if (userIdHeader == null || userIdHeader.isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Missing " + HEADER_USER_ID);
            return;
        }

        UUID userId;
        try {
            userId = UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException ex) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid " + HEADER_USER_ID);
            return;
        }

        List<String> roles = parseRoles(request.getHeader(HEADER_USER_ROLES));
        try {
            RequestUserContext.set(new RequestUser(userId, roles));
            filterChain.doFilter(request, response);
        } finally {
            RequestUserContext.clear();
        }
    }

    private static List<String> parseRoles(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return List.of();
        }
        return Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
