package com.taskflow.auth.service;

import com.taskflow.auth.config.JwtProperties;
import com.taskflow.auth.domain.RefreshToken;
import com.taskflow.auth.domain.User;
import com.taskflow.auth.repository.RefreshTokenRepository;
import com.taskflow.auth.security.TokenHasher;
import com.taskflow.auth.web.error.AuthException;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;
    private final JwtProperties jwtProperties;
    private final RefreshTokenCache refreshTokenCache;

    @Transactional
    public IssuedRefreshToken create(User user, String userAgent, String ipAddress) {
        String raw = tokenHasher.newRefreshToken();
        String hash = tokenHasher.sha256Hex(raw);
        Instant expiresAt = Instant.now().plus(jwtProperties.refreshTokenTtl());
        RefreshToken entity = new RefreshToken(user, hash, expiresAt, userAgent, ipAddress);
        refreshTokenRepository.save(entity);
        refreshTokenCache.remember(hash, user.getId().toString(), expiresAt);
        return new IssuedRefreshToken(raw, entity);
    }

    @Transactional
    public RotationResult rotate(String rawRefreshToken, String userAgent, String ipAddress) {
        String hash = tokenHasher.sha256Hex(rawRefreshToken);
        if (refreshTokenCache.isRevoked(hash)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }
        RefreshToken existing = refreshTokenRepository
                .findByTokenHash(hash)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        Instant now = Instant.now();
        if (!existing.isActive(now)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        User user = existing.getUser();
        existing.revoke();
        refreshTokenCache.forget(hash, existing.getExpiresAt());
        IssuedRefreshToken issued = create(user, userAgent, ipAddress);
        existing.setReplacedBy(issued.entity());
        refreshTokenRepository.save(existing);
        return new RotationResult(issued.raw(), user);
    }

    @Transactional
    public void revokeByRawToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String hash = tokenHasher.sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
            refreshTokenCache.forget(hash, token.getExpiresAt());
        });
    }

  public record IssuedRefreshToken(String raw, RefreshToken entity) {
    }

    public record RotationResult(String rawRefreshToken, User user) {
    }
}
