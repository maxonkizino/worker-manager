package com.taskflow.task.client;

import com.taskflow.task.client.dto.EmployeeAvailabilityResponse;
import java.time.LocalDate;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Slf4j
public class UserServiceClient {

  private final RestClient restClient;

  public UserServiceClient(
      RestClient.Builder restClientBuilder,
      @Value("${taskflow.user-service.base-url}") String baseUrl) {
    this.restClient = restClientBuilder.baseUrl(baseUrl).build();
  }

  public AvailabilityResult checkAvailability(
      UUID employeeId, LocalDate from, LocalDate to) {
    try {
      EmployeeAvailabilityResponse body =
          restClient
              .get()
              .uri(
                  "/internal/employees/{id}/availability?from={from}&to={to}",
                  employeeId,
                  from,
                  to)
              .retrieve()
              .body(EmployeeAvailabilityResponse.class);
      return new AvailabilityResult(true, body, null);
    } catch (RestClientException ex) {
      log.warn("user-service unavailable for employee {}: {}", employeeId, ex.getMessage());
      return new AvailabilityResult(false, null, "user-service unreachable; assignment allowed with warning");
    }
  }

  public record AvailabilityResult(boolean reachable, EmployeeAvailabilityResponse response, String warning) {}
}
