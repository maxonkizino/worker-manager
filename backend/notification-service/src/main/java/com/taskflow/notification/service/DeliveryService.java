package com.taskflow.notification.service;

import com.taskflow.notification.domain.Notification;
import com.taskflow.notification.domain.NotificationDelivery;
import com.taskflow.notification.domain.Recipient;
import com.taskflow.notification.repository.NotificationDeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final NotificationDeliveryRepository notificationDeliveryRepository;

    @Transactional
    public void deliver(Notification notification, Recipient recipient) {
        NotificationDelivery inApp = new NotificationDelivery();
        inApp.setNotificationId(notification.getId());
        inApp.setChannel("IN_APP");
        inApp.setStatus("SENT");
        inApp.setAttempts(1);
        inApp.setSentAt(Instant.now());
        notificationDeliveryRepository.save(inApp);

        stubExternal("EMAIL", recipient.getEmail());
        stubExternal("TELEGRAM", recipient.getTelegramChatId() == null ? null : recipient.getTelegramChatId().toString());
    }

    private void stubExternal(String channel, String target) {
        if (target == null || target.isBlank()) {
            return;
        }
        log.info("Stub {} delivery to {}", channel, target);
    }
}
