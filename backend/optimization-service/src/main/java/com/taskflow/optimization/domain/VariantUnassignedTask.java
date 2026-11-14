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
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "variant_unassigned_tasks")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VariantUnassignedTask {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private OptimizationVariant variant;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_code", nullable = false, length = 30)
    private UnassignedReasonCode reasonCode;

    @Column(length = 1000)
    private String explanation;

    public VariantUnassignedTask(
            OptimizationVariant variant, UUID taskId, UnassignedReasonCode reasonCode, String explanation) {
        this.variant = variant;
        this.taskId = taskId;
        this.reasonCode = reasonCode;
        this.explanation = explanation;
    }
}
