package com.taskflow.analytics;

import com.taskflow.analytics.service.AuditService;
import com.taskflow.analytics.web.AuditController;
import com.taskflow.analytics.web.dto.AuditEntryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.taskflow.analytics.config.SecurityConfig;
import com.taskflow.analytics.security.UserHeaderFilter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuditController.class)
@Import({SecurityConfig.class, UserHeaderFilter.class})
@AutoConfigureMockMvc(addFilters = false)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditService auditService;

    @Test
    void returnsAuditEntries() throws Exception {
        UUID id = UUID.randomUUID();
        when(auditService.recent(anyInt())).thenReturn(List.of(
                new AuditEntryDto(id, null, "task.assigned", "task", id, Map.of(), Instant.parse("2025-01-01T00:00:00Z"))));

        mockMvc.perform(get("/api/audit").param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("task.assigned"));
    }
}
