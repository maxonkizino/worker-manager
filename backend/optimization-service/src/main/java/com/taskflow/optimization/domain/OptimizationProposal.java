package com.taskflow.optimization.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
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
@Table(name = "optimization_proposals")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OptimizationProposal {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ProposalStatus status = ProposalStatus.NEW;

    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_snapshot", nullable = false, columnDefinition = "jsonb")
    private String inputSnapshot = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private long version;

    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptimizationVariant> variants = new ArrayList<>();

    public OptimizationProposal(UUID projectId, UUID requestedBy, String inputSnapshot) {
        this.projectId = projectId;
        this.requestedBy = requestedBy;
        this.inputSnapshot = inputSnapshot;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (requestedAt == null) {
            requestedAt = now;
        }
        createdAt = now;
        updatedAt = now;
    }
}
