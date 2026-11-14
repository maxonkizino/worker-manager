package com.taskflow.notification.web;

import com.taskflow.notification.security.RequestUserIds;
import com.taskflow.notification.service.NotificationQueryService;
import com.taskflow.notification.web.dto.NotificationDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public List<NotificationDto> list(HttpServletRequest request) {
        UUID userId = RequestUserIds.requireUserId(request);
        return notificationQueryService.listForUser(userId);
    }

    @PostMapping("/{id}/read")
    public void markRead(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = RequestUserIds.requireUserId(request);
        notificationQueryService.markRead(userId, id);
    }
}
