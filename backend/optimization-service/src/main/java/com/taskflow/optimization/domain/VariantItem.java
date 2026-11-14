package com.taskflow.optimization.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "variant_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VariantItem {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private OptimizationVariant variant;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "planned_hours", nullable = false, precision = 8, scale = 2)
    private BigDecimal plannedHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_code", nullable = false, length = 30)
    private VariantItemReasonCode reasonCode;

    @Column(length = 1000)
    private String explanation;

    public VariantItem(
            OptimizationVariant variant,
            UUID taskId,
            UUID employeeId,
            BigDecimal plannedHours,
            VariantItemReasonCode reasonCode,
            String explanation) {
        this.variant = variant;
        this.taskId = taskId;
        this.employeeId = employeeId;
        this.plannedHours = plannedHours;
        this.reasonCode = reasonCode;
        this.explanation = explanation;
    }
}
