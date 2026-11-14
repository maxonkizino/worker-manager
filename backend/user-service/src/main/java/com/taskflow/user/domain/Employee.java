package com.taskflow.user.domain;

import com.taskflow.user.domain.enums.PreferredChannel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "employees")
@Getter
@Setter
public class Employee {

    @Id
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(length = 120)
    private String position;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "schedule_id", nullable = false)
    private UUID scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private WorkSchedule schedule;

    @Column(name = "useful_time_factor", nullable = false, precision = 3, scale = 2)
    private BigDecimal usefulTimeFactor = new BigDecimal("0.80");

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "telegram_chat_id")
    private Long telegramChatId;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_channel", nullable = false, length = 10)
    private PreferredChannel preferredChannel = PreferredChannel.IN_APP;

    @Column(name = "avatar_preset", length = 40)
    private String avatarPreset;

    @Column(name = "use_custom_avatar", nullable = false)
    private boolean useCustomAvatar = false;

    @Column(name = "avatar_revision", nullable = false)
    private int avatarRevision;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Version
    private Long version;
}
