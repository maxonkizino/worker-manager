package com.taskflow.user.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ReferenceCache {

    public static final Duration TTL = Duration.ofMinutes(5);
    public static final String SETTINGS_KEY = "cache:settings";

    private final ObjectProvider<StringRedisTemplate> redisProvider;
    private final ObjectMapper objectMapper;

    public ReferenceCache(ObjectProvider<StringRedisTemplate> redisProvider, ObjectMapper objectMapper) {
        this.redisProvider = redisProvider;
        this.objectMapper = objectMapper;
    }

    public static String skillsKey(UUID employeeId) {
        return "cache:skills:" + employeeId;
    }

    public static String capacityKey(UUID employeeId, LocalDate from, LocalDate to) {
        return "cache:capacity:" + employeeId + ":" + from + ":" + to;
    }

    public <T> Optional<T> get(String key, TypeReference<T> type) {
        String raw = read(key);
        if (raw == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(raw, type));
        } catch (JsonProcessingException ex) {
            log.warn("Drop unreadable cache key {}", key);
            evict(key);
            return Optional.empty();
        }
    }

    public Optional<String> get(String key) {
        return Optional.ofNullable(read(key));
    }

    public void put(String key, Object value) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return;
        }
        try {
            redis.opsForValue().set(key, objectMapper.writeValueAsString(value), TTL);
        } catch (JsonProcessingException ex) {
            log.warn("Skip cache write for {}: {}", key, ex.getMessage());
        }
    }

    public void putText(String key, String value) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return;
        }
        redis.opsForValue().set(key, value, TTL);
    }

    public void rememberCapacity(UUID employeeId, String key) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return;
        }
        String index = capacityIndex(employeeId);
        redis.opsForSet().add(index, key);
        redis.expire(index, TTL);
    }

    public void evict(String key) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis != null) {
            redis.delete(key);
        }
    }

    public void evictCapacity(UUID employeeId) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return;
        }
        String index = capacityIndex(employeeId);
        Set<String> keys = redis.opsForSet().members(index);
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
        }
        redis.delete(index);
    }

    private String read(String key) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return null;
        }
        return redis.opsForValue().get(key);
    }

    private static String capacityIndex(UUID employeeId) {
        return "cache:capacity:index:" + employeeId;
    }
}
