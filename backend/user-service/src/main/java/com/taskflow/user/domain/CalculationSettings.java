package com.taskflow.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "calculation_settings")
@Getter
@Setter
public class CalculationSettings {

    @Id
    private Short id = 1;

    @Column(name = "useful_time_factor", nullable = false, precision = 3, scale = 2)
    private BigDecimal usefulTimeFactor = new BigDecimal("0.80");

    @Column(name = "overload_threshold", nullable = false, precision = 4, scale = 2)
    private BigDecimal overloadThreshold = new BigDecimal("1.00");

    @Column(name = "underload_threshold", nullable = false, precision = 4, scale = 2)
    private BigDecimal underloadThreshold = new BigDecimal("0.50");

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal alpha = BigDecimal.ONE;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal beta = new BigDecimal("10");

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal gamma = BigDecimal.ONE;

    @Column(nullable = false, precision = 8, scale = 3)
    private BigDecimal delta = new BigDecimal("5");

    @Column(name = "horizon_days", nullable = false)
    private Integer horizonDays = 14;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Version
    private Long version;
}
