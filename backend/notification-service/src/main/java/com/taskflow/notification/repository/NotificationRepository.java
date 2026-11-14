package com.taskflow.notification.repository;

import com.taskflow.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);

    List<Notification> findByRecipientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID recipientId, Instant from, Instant to);
}
