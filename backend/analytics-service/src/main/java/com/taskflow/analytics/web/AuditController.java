package com.taskflow.analytics.web;

import com.taskflow.analytics.security.RequestUserIds;
import com.taskflow.analytics.service.AuditService;
import com.taskflow.analytics.web.dto.AuditEntryDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public List<AuditEntryDto> audit(HttpServletRequest request, @RequestParam(defaultValue = "50") int limit) {
        RequestUserIds.requireAnyRole(request, "ADMIN");
        return auditService.recent(limit);
    }
}
