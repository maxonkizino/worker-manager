package com.taskflow.auth.security;

import com.taskflow.auth.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public IssuedAccessToken issueAccessToken(UUID userId, String username, List<String> roles) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.accessTokenTtl());
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .id(jti)
                .subject(userId.toString())
                .claim("username", username)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
        return new IssuedAccessToken(token, jti, properties.accessTokenTtl().toSeconds());
    }

    public ParsedAccessToken parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        UUID userId = UUID.fromString(claims.getSubject());
        String jti = claims.getId();
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);
        String username = claims.get("username", String.class);
        return new ParsedAccessToken(userId, username, roles, jti, claims.getExpiration().toInstant());
    }

    public record IssuedAccessToken(String token, String jti, long expiresInSeconds) {
    }

    public record ParsedAccessToken(
            UUID userId, String username, List<String> roles, String jti, Instant expiresAt) {
    }
}
