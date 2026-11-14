package com.taskflow.task.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.task.domain.enums.TaskPriority;
import com.taskflow.task.domain.enums.TaskStatus;
import com.taskflow.task.web.dto.TaskDtos.CreateTaskRequest;
import com.taskflow.task.web.dto.TaskDtos.StatusChangeRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class TaskLifecycleIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withDatabaseName("task_db")
          .withUsername("taskflow")
          .withPassword("taskflow");

  @DynamicPropertySource
  static void datasourceProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired MockMvc mockMvc;
  @Autowired ObjectMapper objectMapper;

  @Test
  void createsTaskAndTransitionsToCancelled() throws Exception {
    UUID userId = UUID.randomUUID();
    UUID managerId = UUID.randomUUID();
    UUID projectId = createProject(userId, managerId);

    CreateTaskRequest create =
        new CreateTaskRequest(
            projectId,
            "Implement API",
            "desc",
            TaskPriority.HIGH,
            LocalDate.now(),
            LocalDate.now().plusDays(5),
            new BigDecimal("8.00"));

    MvcResult created =
        mockMvc
            .perform(
                post("/api/tasks")
                    .header("X-User-Id", userId.toString())
                    .header("X-User-Roles", "ROLE_MANAGER")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(create)))
            .andExpect(status().isCreated())
            .andReturn();

    var taskNode = objectMapper.readTree(created.getResponse().getContentAsString());
    UUID taskId = UUID.fromString(taskNode.get("id").asText());
    assertThat(taskNode.get("status").asText()).isEqualTo("CREATED");

    StatusChangeRequest cancel = new StatusChangeRequest(TaskStatus.CANCELLED);
    mockMvc
        .perform(
            post("/api/tasks/" + taskId + "/status")
                .header("X-User-Id", userId.toString())
                .header("X-User-Roles", "ROLE_MANAGER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancel)))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/api/tasks/" + taskId)
            .header("X-User-Id", userId.toString())
            .header("X-User-Roles", "ROLE_MANAGER"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("CANCELLED"));
  }

  private UUID createProject(UUID userId, UUID managerId) throws Exception {
    String body =
        """
        {
          "name": "Test Project",
          "description": "integration",
          "managerId": "%s",
          "startDate": "%s",
          "status": "ACTIVE"
        }
        """
            .formatted(managerId, LocalDate.now());

    MvcResult result =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("X-User-Id", userId.toString())
                    .header("X-User-Roles", "ROLE_MANAGER")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(status().isCreated())
            .andReturn();
    return UUID.fromString(
        objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText());
  }
}
