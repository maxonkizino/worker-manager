package com.taskflow.optimization.client;

import com.taskflow.optimization.client.dto.CapacityBatchRequest;
import com.taskflow.optimization.client.dto.CapacityBatchResponse;
import com.taskflow.optimization.config.TaskflowServiceProperties;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final TaskflowServiceProperties properties;

    public Optional<CapacityBatchResponse> fetchCapacity(CapacityBatchRequest request) {
        String url = properties.getUserServiceUrl() + "/internal/capacity/batch";
        try {
            CapacityBatchResponse body = restTemplate.postForObject(url, request, CapacityBatchResponse.class);
            return Optional.ofNullable(body);
        } catch (RestClientException ex) {
            log.warn("Failed to fetch employee capacity: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
