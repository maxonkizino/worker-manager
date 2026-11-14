package com.taskflow.notification.service;

import com.taskflow.notification.domain.Notification;
import com.taskflow.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarExportService {

    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public String exportIcs(UUID userId, LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        List<Notification> assignments = notificationRepository
                .findByRecipientIdAndCreatedAtBetweenOrderByCreatedAtDesc(userId, fromInstant, toInstant)
                .stream()
                .filter(n -> "ASSIGNMENT".equals(n.getType()))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//TaskFlow Planner//EN\r\n");
        if (assignments.isEmpty()) {
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:placeholder-").append(userId).append("@taskflow\r\n");
            sb.append("SUMMARY:Task assignment placeholder\r\n");
            sb.append("DTSTART;VALUE=DATE:").append(ICS_DATE.format(from)).append("\r\n");
            sb.append("DTEND;VALUE=DATE:").append(ICS_DATE.format(from.plusDays(1))).append("\r\n");
            sb.append("END:VEVENT\r\n");
        } else {
            for (Notification assignment : assignments) {
                LocalDate day = assignment.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
                sb.append("BEGIN:VEVENT\r\n");
                sb.append("UID:").append(assignment.getId()).append("@taskflow\r\n");
                sb.append("SUMMARY:").append(escape(assignment.getTitle())).append("\r\n");
                sb.append("DESCRIPTION:").append(escape(assignment.getBody())).append("\r\n");
                sb.append("DTSTART;VALUE=DATE:").append(ICS_DATE.format(day)).append("\r\n");
                sb.append("DTEND;VALUE=DATE:").append(ICS_DATE.format(day.plusDays(1))).append("\r\n");
                sb.append("END:VEVENT\r\n");
            }
        }
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private static String escape(String value) {
        return value == null ? "" : value.replace("\n", "\\n").replace(",", "\\,");
    }
}
