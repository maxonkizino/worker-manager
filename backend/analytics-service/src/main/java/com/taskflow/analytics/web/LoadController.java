package com.taskflow.analytics.web;

import com.taskflow.analytics.security.RequestUserIds;
import com.taskflow.analytics.service.WorkloadService;
import com.taskflow.analytics.web.dto.PersonalLoadDto;
import com.taskflow.analytics.web.dto.TeamLoadResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/load")
@RequiredArgsConstructor
public class LoadController {

    private final WorkloadService workloadService;

    @GetMapping("/team")
    public TeamLoadResponse teamLoad(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID projectId) {
        RequestUserIds.requireAnyRole(request, "MANAGER");
        return workloadService.teamLoad(from, to, projectId);
    }

    @GetMapping("/me")
    public PersonalLoadDto myLoad(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        RequestUserIds.requireAnyRole(request, "MANAGER", "EMPLOYEE");
        UUID userId = RequestUserIds.requireUserId(request);
        return workloadService.myLoad(userId, from, to);
    }
}
