package com.taskflow.analytics.client;

import com.taskflow.analytics.config.TaskflowUserServiceProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class UserCapacityClient {

    private static final Logger log = LoggerFactory.getLogger(UserCapacityClient.class);
    private static final BigDecimal DEFAULT_DAILY_CAPACITY = BigDecimal.valueOf(8);

    private final RestClient restClient;

    public UserCapacityClient(TaskflowUserServiceProperties properties) {
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    public BigDecimal totalCapacity(UUID employeeId, LocalDate from, LocalDate to) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/internal/capacity/batch")
                    .body(Map.of(
                            "employeeIds", List.of(employeeId.toString()),
                            "from", from.toString(),
                            "to", to.toString()))
                    .retrieve()
                    .body(Map.class);
            if (response == null) {
                return fallbackCapacity(from, to);
            }
            Object items = response.get("items");
            if (items instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> row) {
                Object total = row.get("totalCapacityHours");
                if (total instanceof Number number) {
                    return BigDecimal.valueOf(number.doubleValue());
                }
            }
        } catch (RestClientException ex) {
            log.debug("User-service capacity unavailable, using fallback: {}", ex.getMessage());
        }
        return fallbackCapacity(from, to);
    }

    private BigDecimal fallbackCapacity(LocalDate from, LocalDate to) {
        long days = Math.max(1, to.toEpochDay() - from.toEpochDay() + 1);
        return DEFAULT_DAILY_CAPACITY.multiply(BigDecimal.valueOf(days));
    }

    public Map<UUID, BigDecimal> batchCapacity(List<UUID> employeeIds, LocalDate from, LocalDate to) {
        Map<UUID, BigDecimal> result = new HashMap<>();
        for (UUID id : employeeIds) {
            result.put(id, totalCapacity(id, from, to));
        }
        return result;
    }
}
