package com.taskflow.auth.service;

import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenCache {

    private static final String ACTIVE_PREFIX = "auth:refresh:";
    private static final String REVOKED_PREFIX = "auth:refresh:revoked:";

    private final ObjectProvider<StringRedisTemplate> redisProvider;

    public RefreshTokenCache(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redisProvider = redisProvider;
    }

    public void remember(String hash, String userId, Instant expiresAt) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (redis == null || hash == null || ttl.isNegative() || ttl.isZero()) {
            return;
        }
        redis.delete(REVOKED_PREFIX + hash);
        redis.opsForValue().set(ACTIVE_PREFIX + hash, userId, ttl);
    }

    public void forget(String hash, Instant expiresAt) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null || hash == null) {
            return;
        }
        redis.delete(ACTIVE_PREFIX + hash);
        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (!ttl.isNegative() && !ttl.isZero()) {
            redis.opsForValue().set(REVOKED_PREFIX + hash, "1", ttl);
        }
    }

    public boolean isRevoked(String hash) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null || hash == null) {
            return false;
        }
        return Boolean.TRUE.equals(redis.hasKey(REVOKED_PREFIX + hash));
    }
}
