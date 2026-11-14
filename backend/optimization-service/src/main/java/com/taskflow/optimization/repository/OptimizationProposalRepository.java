package com.taskflow.optimization.repository;

import com.taskflow.optimization.domain.OptimizationProposal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptimizationProposalRepository extends JpaRepository<OptimizationProposal, UUID> {

    List<OptimizationProposal> findByProjectIdOrderByRequestedAtDesc(UUID projectId);

    @EntityGraph(attributePaths = {"variants", "variants.items", "variants.unassignedTasks"})
    Optional<OptimizationProposal> findWithVariantsById(UUID id);
}
