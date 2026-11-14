package com.taskflow.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "work_schedule_days")
@IdClass(WorkScheduleDay.WorkScheduleDayId.class)
@Getter
@Setter
public class WorkScheduleDay {

    @Id
    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Id
    @Column(name = "day_of_week")
    private Short dayOfWeek;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal hours;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private WorkSchedule schedule;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class WorkScheduleDayId implements Serializable {
        private UUID scheduleId;
        private Short dayOfWeek;
    }
}
