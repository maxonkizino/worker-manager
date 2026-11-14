package com.taskflow.user.domain;

import com.taskflow.user.domain.enums.NonWorkingDayKind;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "non_working_days")
@Getter
@Setter
public class NonWorkingDay {

    @Id
    private UUID id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NonWorkingDayKind kind = NonWorkingDayKind.HOLIDAY;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
