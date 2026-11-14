package com.taskflow.userservice.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.user.config.SecurityConfig;
import com.taskflow.user.config.TaskflowJwtProperties;
import com.taskflow.user.domain.enums.PreferredChannel;
import com.taskflow.user.security.GatewayAuthenticationFilter;
import com.taskflow.user.service.CapacityService;
import com.taskflow.user.service.EmployeeService;
import com.taskflow.user.web.EmployeeController;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest
@ContextConfiguration(classes = {
    EmployeeControllerMvcTest.MvcTestApp.class,
    EmployeeController.class,
    SecurityConfig.class,
    GatewayAuthenticationFilter.class
})
@TestPropertySource(properties = "taskflow.jwt.secret=taskflow-local-jwt-secret-key-min-32-chars!!")
class EmployeeControllerMvcTest {

    @EnableAutoConfiguration
    @EnableConfigurationProperties(TaskflowJwtProperties.class)
    @TestConfiguration
    static class MvcTestApp {}

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    @MockBean
    private CapacityService capacityService;

    @Test
    void listEmployees_requiresGatewayHeaders() throws Exception {
        mockMvc.perform(get("/api/employees")).andExpect(status().isForbidden());
    }

    @Test
    void listEmployees_withHeaders_returnsPayload() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        when(employeeService.findAll())
                .thenReturn(List.of(new EmployeeResponse(
                        employeeId,
                        "Jane Doe",
                        "jane@example.com",
                        "Dev",
                        null,
                        UUID.randomUUID(),
                        new BigDecimal("0.80"),
                        true,
                        null,
                        PreferredChannel.IN_APP,
                        null,
                        false,
                        0,
                        0L,
                        null,
                        null,
                        null,
                        false,
                        false)));

        mockMvc.perform(get("/api/employees")
                        .header("X-User-Id", userId.toString())
                        .header("X-User-Roles", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Jane Doe"))
                .andExpect(jsonPath("$[0].email").value("jane@example.com"));
    }

    @Test
    void capacityEndpoint_delegatesToService() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        when(capacityService.employeeCapacity(any(), any(), any())).thenReturn(new BigDecimal("16.0"));

        mockMvc.perform(get("/api/employees/{id}/capacity", employeeId)
                        .param("from", "2026-01-06")
                        .param("to", "2026-01-07")
                        .header("X-User-Id", userId.toString())
                        .header("X-User-Roles", "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.capacityHours").value(16.0));
    }
}
