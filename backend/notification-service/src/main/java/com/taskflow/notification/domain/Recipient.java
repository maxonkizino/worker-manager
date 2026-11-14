package com.taskflow.notification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recipients")
@Getter
@Setter
public class Recipient {

    @Id
    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String email;

    @Column(name = "telegram_chat_id")
    private Long telegramChatId;

    @Column(name = "preferred_channel", nullable = false, length = 10)
    private String preferredChannel = "IN_APP";

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
