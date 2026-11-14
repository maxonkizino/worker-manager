package com.taskflow.notification.service;

import com.taskflow.notification.domain.Notification;
import com.taskflow.notification.domain.Recipient;
import com.taskflow.notification.repository.NotificationRepository;
import com.taskflow.notification.repository.RecipientRepository;
import com.taskflow.notification.web.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class NotificationQueryService {

    private final NotificationRepository notificationRepository;
    private final RecipientRepository recipientRepository;
    private final DeliveryService deliveryService;

    @Transactional(readOnly = true)
    public List<NotificationDto> listForUser(UUID userId) {
        ensureRecipient(userId);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationQueryService::toDto)
                .toList();
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));
        if (!notification.getRecipientId().equals(userId)) {
            throw new ResponseStatusException(NOT_FOUND, "Notification not found");
        }
        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
        }
    }

    @Transactional
    public Notification createAssignment(
            UUID recipientId, String title, String body, java.util.Map<String, Object> payload) {
        Recipient recipient = ensureRecipient(recipientId);
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType("ASSIGNMENT");
        notification.setTitle(title);
        notification.setBody(body);
        notification.setPayload(payload == null ? java.util.Map.of() : payload);
        notification = notificationRepository.save(notification);
        deliveryService.deliver(notification, recipient);
        return notification;
    }

    private Recipient ensureRecipient(UUID employeeId) {
        return recipientRepository.findById(employeeId).orElseGet(() -> {
            Recipient created = new Recipient();
            created.setEmployeeId(employeeId);
            created.setFullName("Employee " + employeeId);
            return recipientRepository.save(created);
        });
    }

    private static NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                notification.getPayload(),
                notification.getCreatedAt(),
                notification.getReadAt());
    }
}
