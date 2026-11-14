package com.taskflow.analytics.web;

import com.taskflow.analytics.security.RequestUserIds;
import com.taskflow.analytics.service.ReportService;
import com.taskflow.analytics.web.dto.DeadlineReportResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportService reportService;

    @GetMapping("/deadlines")
    public DeadlineReportResponse deadlines(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        RequestUserIds.requireAnyRole(request, "MANAGER");
        return reportService.deadlines(from, to);
    }
}
