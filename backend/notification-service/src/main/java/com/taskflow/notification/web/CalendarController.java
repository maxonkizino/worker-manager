package com.taskflow.notification.web;

import com.taskflow.notification.security.RequestUserIds;
import com.taskflow.notification.service.CalendarExportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarExportService calendarExportService;

    @GetMapping(value = "/export.ics", produces = "text/calendar")
    public String exportIcs(
            HttpServletRequest request,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return calendarExportService.exportIcs(RequestUserIds.requireUserId(request), from, to);
    }
}
