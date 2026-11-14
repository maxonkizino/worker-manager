package com.taskflow.optimization.client;

import com.taskflow.optimization.client.dto.AssignmentBatchRequest;
import com.taskflow.optimization.client.dto.TaskSnapshotDto;
import com.taskflow.optimization.config.TaskflowServiceProperties;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskServiceClient {

    private final RestTemplate restTemplate;
    private final TaskflowServiceProperties properties;

    public Optional<TaskSnapshotDto> fetchSnapshot(UUID projectId, LocalDate from, LocalDate to) {
        String url = UriComponentsBuilder.fromUriString(properties.getTaskServiceUrl() + "/internal/snapshot")
                .queryParam("projectId", projectId)
                .queryParam("from", from)
                .queryParam("to", to)
                .toUriString();
        try {
            TaskSnapshotDto body = restTemplate.getForObject(url, TaskSnapshotDto.class);
            return Optional.ofNullable(body);
        } catch (RestClientException ex) {
            log.warn("Failed to fetch task snapshot for project {}: {}", projectId, ex.getMessage());
            return Optional.empty();
        }
    }

    public ApplyResult applyAssignments(AssignmentBatchRequest request) {
        String url = properties.getTaskServiceUrl() + "/internal/assignments/batch";
        try {
            restTemplate.postForEntity(url, request, Void.class);
            return ApplyResult.SUCCESS;
        } catch (RestClientException ex) {
            if (ex instanceof org.springframework.web.client.HttpStatusCodeException httpEx
                    && httpEx.getStatusCode().value() == 409) {
                return ApplyResult.CONFLICT;
            }
            log.warn("Failed to apply assignments for proposal {}: {}", request.proposalId(), ex.getMessage());
            return ApplyResult.ERROR;
        }
    }

    public enum ApplyResult {
        SUCCESS,
        CONFLICT,
        ERROR
    }
}
