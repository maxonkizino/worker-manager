package com.taskflow.notification.repository;

import com.taskflow.notification.domain.NotificationDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, UUID> {
}
