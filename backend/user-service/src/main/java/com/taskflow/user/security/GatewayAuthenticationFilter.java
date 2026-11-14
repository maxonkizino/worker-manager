package com.taskflow.user.security;

import com.taskflow.user.config.TaskflowJwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_ROLES = "X-User-Roles";

    private final TaskflowJwtProperties jwtProperties;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UUID userId = parseHeaderUserId(request);
            List<String> roles = parseHeaderRoles(request);

            if (userId == null) {
                userId = parseJwtUserId(request);
                if (roles.isEmpty()) {
                    roles = parseJwtRoles(request);
                }
            }

            if (userId != null) {
                Collection<SimpleGrantedAuthority> authorities = roles.stream()
                        .filter(r -> !r.isBlank())
                        .map(String::trim)
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet());
                var principal = new TaskflowUserPrincipal(userId, authorities);
                var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

    private UUID parseHeaderUserId(HttpServletRequest request) {
        String raw = request.getHeader(HEADER_USER_ID);
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private List<String> parseHeaderRoles(HttpServletRequest request) {
        String raw = request.getHeader(HEADER_USER_ROLES);
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private UUID parseJwtUserId(HttpServletRequest request) {
        Claims claims = parseJwtClaims(request);
        if (claims == null) {
            return null;
        }
        try {
            return UUID.fromString(claims.getSubject());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJwtRoles(HttpServletRequest request) {
        Claims claims = parseJwtClaims(request);
        if (claims == null) {
            return List.of();
        }
        Object roles = claims.get("roles");
        if (roles instanceof Collection<?> collection) {
            return collection.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    private Claims parseJwtClaims(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7);
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (Exception ex) {
            return null;
        }
    }
}
