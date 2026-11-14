package com.taskflow.optimization.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "optimization_variants")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OptimizationVariant {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proposal_id", nullable = false)
    private OptimizationProposal proposal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VariantKind kind;

    @Column(name = "objective_score", nullable = false, precision = 14, scale = 4)
    private BigDecimal objectiveScore;

    @Column(nullable = false)
    private boolean selected;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String metrics = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariantItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariantUnassignedTask> unassignedTasks = new ArrayList<>();

    public OptimizationVariant(
            OptimizationProposal proposal,
            VariantKind kind,
            BigDecimal objectiveScore,
            boolean selected,
            String metrics) {
        this.proposal = proposal;
        this.kind = kind;
        this.objectiveScore = objectiveScore;
        this.selected = selected;
        this.metrics = metrics;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
