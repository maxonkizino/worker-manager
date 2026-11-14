package com.taskflow.auth.service;

import com.taskflow.auth.config.TaskflowRedisProperties;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "auth:blacklist:";

    private final TaskflowRedisProperties redisProperties;
    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;

    public TokenBlacklistService(
            TaskflowRedisProperties redisProperties, ObjectProvider<StringRedisTemplate> redisTemplateProvider) {
        this.redisProperties = redisProperties;
        this.redisTemplateProvider = redisTemplateProvider;
    }

    public void blacklist(String jti, Instant expiresAt) {
        StringRedisTemplate redisTemplate = redisTemplateProvider.getIfAvailable();
        if (!redisProperties.enabled() || redisTemplate == null || jti == null) {
            return;
        }
        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (ttl.isNegative() || ttl.isZero()) {
            return;
        }
        redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", ttl);
    }

    public boolean isBlacklisted(String jti) {
        StringRedisTemplate redisTemplate = redisTemplateProvider.getIfAvailable();
        if (!redisProperties.enabled() || redisTemplate == null || jti == null) {
            return false;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    }
}
