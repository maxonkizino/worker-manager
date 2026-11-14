package com.taskflow.optimization.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.optimization.algorithm.GreedyAssignmentEngine;
import com.taskflow.optimization.algorithm.GreedyAssignmentEngine.GreedyAssignment;
import com.taskflow.optimization.algorithm.GreedyAssignmentEngine.GreedyInput;
import com.taskflow.optimization.algorithm.GreedyAssignmentEngine.GreedyResult;
import com.taskflow.optimization.algorithm.GreedyAssignmentEngine.GreedyUnassigned;
import com.taskflow.optimization.client.TaskServiceClient;
import com.taskflow.optimization.client.UserServiceClient;
import com.taskflow.optimization.client.dto.AssignmentBatchRequest;
import com.taskflow.optimization.client.dto.CapacityBatchRequest;
import com.taskflow.optimization.client.dto.CapacityBatchResponse;
import com.taskflow.optimization.client.dto.TaskSnapshotDto;
import com.taskflow.optimization.domain.OptimizationProposal;
import com.taskflow.optimization.domain.OptimizationVariant;
import com.taskflow.optimization.domain.ProposalStatus;
import com.taskflow.optimization.domain.VariantItem;
import com.taskflow.optimization.domain.VariantKind;
import com.taskflow.optimization.domain.VariantUnassignedTask;
import com.taskflow.optimization.dto.CreateProposalRequest;
import com.taskflow.optimization.dto.CreateProposalResponse;
import com.taskflow.optimization.dto.ProposalDetailResponse;
import com.taskflow.optimization.dto.ProposalSummaryResponse;
import com.taskflow.optimization.dto.RejectProposalRequest;
import com.taskflow.optimization.exception.InvalidProposalStateException;
import com.taskflow.optimization.exception.ProposalNotFoundException;
import com.taskflow.optimization.repository.OptimizationProposalRepository;
import com.taskflow.optimization.security.RequestUserContext;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final OptimizationProposalRepository proposalRepository;
    private final TaskServiceClient taskServiceClient;
    private final UserServiceClient userServiceClient;
    private final GreedyAssignmentEngine greedyEngine;
    private final ObjectMapper objectMapper;

    @Transactional
    public CreateProposalResponse create(CreateProposalRequest request) {
        UUID requestedBy = RequestUserContext.get().userId();
        List<String> warnings = new ArrayList<>();

        Optional<TaskSnapshotDto> snapshotOpt =
                taskServiceClient.fetchSnapshot(request.projectId(), request.horizonStart(), request.horizonEnd());
        if (snapshotOpt.isEmpty()) {
            warnings.add("task-service snapshot unavailable; proposal created with empty assignment result");
        }

        TaskSnapshotDto snapshot = snapshotOpt.orElse(new TaskSnapshotDto(null, request.projectId(), List.of(), List.of()));
        List<UUID> memberIds = snapshot.projectMemberEmployeeIds() != null
                ? snapshot.projectMemberEmployeeIds()
                : List.of();

        Optional<CapacityBatchResponse> capacityOpt = Optional.empty();
        if (!memberIds.isEmpty()) {
            capacityOpt = userServiceClient.fetchCapacity(
                    new CapacityBatchRequest(memberIds, request.horizonStart(), request.horizonEnd()));
        }
        if (capacityOpt.isEmpty()) {
            warnings.add("user-service capacity unavailable; capacity constraints not applied");
        }

        List<CapacityBatchResponse.EmployeeCapacityDto> capacities = capacityOpt
                .map(CapacityBatchResponse::capacities)
                .orElse(List.of());

        GreedyResult greedyResult = greedyEngine.run(new GreedyInput(
                snapshot.tasks() != null ? snapshot.tasks() : List.of(), capacities, memberIds));
        warnings.addAll(greedyResult.notes());

        String inputSnapshotJson = buildInputSnapshot(request, snapshot, capacities, warnings);
        OptimizationProposal proposal = new OptimizationProposal(request.projectId(), requestedBy, inputSnapshotJson);
        proposalRepository.save(proposal);

        OptimizationVariant variant = new OptimizationVariant(
                proposal,
                VariantKind.GREEDY,
                greedyResult.objectiveScore(),
                true,
                metricsJson(greedyResult));
        proposal.getVariants().add(variant);

        for (GreedyAssignment assignment : greedyResult.assignments()) {
            variant.getItems()
                    .add(new VariantItem(
                            variant,
                            assignment.taskId(),
                            assignment.employeeId(),
                            assignment.plannedHours(),
                            assignment.reasonCode(),
                            assignment.explanation()));
        }
        for (GreedyUnassigned unassigned : greedyResult.unassigned()) {
            variant.getUnassignedTasks()
                    .add(new VariantUnassignedTask(
                            variant, unassigned.taskId(), unassigned.reasonCode(), unassigned.explanation()));
        }

        proposalRepository.save(proposal);

        String explanation = buildExplanation(greedyResult, warnings);
        ProposalSummaryResponse summary = new ProposalSummaryResponse(
                proposal.getId(),
                proposal.getProjectId(),
                proposal.getStatus(),
                proposal.getRequestedAt(),
                greedyResult.assignments().size(),
                greedyResult.unassigned().size(),
                greedyResult.objectiveScore(),
                warnings,
                explanation);

        return new CreateProposalResponse(proposal.getId(), summary);
    }

    @Transactional(readOnly = true)
    public ProposalDetailResponse getById(UUID id) {
        OptimizationProposal proposal = proposalRepository
                .findWithVariantsById(id)
                .orElseThrow(() -> new ProposalNotFoundException(id));
        return toDetail(proposal, List.of());
    }

    @Transactional(readOnly = true)
    public List<ProposalSummaryResponse> listByProject(UUID projectId) {
        return proposalRepository.findByProjectIdOrderByRequestedAtDesc(projectId).stream()
                .map(p -> new ProposalSummaryResponse(
                        p.getId(),
                        p.getProjectId(),
                        p.getStatus(),
                        p.getRequestedAt(),
                        0,
                        0,
                        null,
                        List.of(),
                        null))
                .toList();
    }

    @Transactional
    public ProposalDetailResponse apply(UUID id) {
        OptimizationProposal proposal = proposalRepository
                .findWithVariantsById(id)
                .orElseThrow(() -> new ProposalNotFoundException(id));
        if (proposal.getStatus() != ProposalStatus.NEW) {
            throw new InvalidProposalStateException("Only NEW proposals can be applied");
        }

        OptimizationVariant variant = proposal.getVariants().stream()
                .filter(OptimizationVariant::isSelected)
                .findFirst()
                .orElseThrow(() -> new InvalidProposalStateException("No selected variant on proposal"));

        Long dataVersion = readDataVersion(proposal.getInputSnapshot());
        List<AssignmentBatchRequest.AssignmentItemDto> items = variant.getItems().stream()
                .map(i -> new AssignmentBatchRequest.AssignmentItemDto(i.getTaskId(), i.getEmployeeId(), i.getPlannedHours()))
                .toList();

        TaskServiceClient.ApplyResult result = taskServiceClient.applyAssignments(
                new AssignmentBatchRequest(dataVersion, proposal.getId(), items));

        return switch (result) {
            case CONFLICT -> {
                proposal.setStatus(ProposalStatus.OUTDATED);
                proposalRepository.save(proposal);
                yield toDetail(proposal, List.of("task-service rejected apply: data version conflict (OUTDATED)"));
            }
            case ERROR -> throw new InvalidProposalStateException("task-service apply failed");
            case SUCCESS -> {
                proposal.setStatus(ProposalStatus.APPLIED);
                proposal.setAppliedAt(Instant.now());
                proposalRepository.save(proposal);
                yield toDetail(proposal, List.of());
            }
        };
    }

    @Transactional
    public ProposalDetailResponse reject(UUID id, RejectProposalRequest request) {
        OptimizationProposal proposal = proposalRepository
                .findWithVariantsById(id)
                .orElseThrow(() -> new ProposalNotFoundException(id));
        if (proposal.getStatus() != ProposalStatus.NEW) {
            throw new InvalidProposalStateException("Only NEW proposals can be rejected");
        }
        proposal.setStatus(ProposalStatus.REJECTED);
        proposal.setRejectedAt(Instant.now());
        proposal.setInputSnapshot(mergeRejectComment(proposal.getInputSnapshot(), request.comment()));
        proposalRepository.save(proposal);
        return toDetail(proposal, List.of());
    }

    private ProposalDetailResponse toDetail(OptimizationProposal proposal, List<String> warnings) {
        List<ProposalDetailResponse.VariantView> variants = proposal.getVariants().stream()
                .map(v -> new ProposalDetailResponse.VariantView(
                        v.getId(),
                        v.getKind(),
                        v.isSelected(),
                        v.getObjectiveScore(),
                        v.getItems().stream()
                                .map(i -> new ProposalDetailResponse.AssignmentView(
                                        i.getTaskId(),
                                        i.getEmployeeId(),
                                        i.getPlannedHours(),
                                        i.getReasonCode(),
                                        i.getExplanation()))
                                .toList(),
                        v.getUnassignedTasks().stream()
                                .map(u -> new ProposalDetailResponse.UnassignedView(
                                        u.getTaskId(), u.getReasonCode(), u.getExplanation()))
                                .toList()))
                .toList();

        return new ProposalDetailResponse(
                proposal.getId(),
                proposal.getProjectId(),
                proposal.getStatus(),
                proposal.getRequestedAt(),
                proposal.getAppliedAt(),
                proposal.getRejectedAt(),
                proposal.getRequestedBy(),
                variants,
                warnings);
    }

    private String buildInputSnapshot(
            CreateProposalRequest request,
            TaskSnapshotDto snapshot,
            List<CapacityBatchResponse.EmployeeCapacityDto> capacities,
            List<String> warnings) {
        Map<String, Object> map = new HashMap<>();
        map.put("horizonStart", request.horizonStart().toString());
        map.put("horizonEnd", request.horizonEnd().toString());
        map.put("alpha", request.alpha());
        map.put("beta", request.beta());
        map.put("gamma", request.gamma());
        map.put("delta", request.delta());
        map.put("dataVersion", snapshot.dataVersion());
        map.put("snapshot", snapshot);
        map.put("capacities", capacities);
        map.put("warnings", warnings);
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String metricsJson(GreedyResult result) {
        Map<String, Object> metrics = Map.of(
                "assigned", result.assignments().size(),
                "unassigned", result.unassigned().size(),
                "algorithm", "GREEDY");
        try {
            return objectMapper.writeValueAsString(metrics);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private Long readDataVersion(String inputSnapshot) {
        try {
            Map<String, Object> map = objectMapper.readValue(inputSnapshot, new TypeReference<>() {});
            Object value = map.get("dataVersion");
            if (value instanceof Number number) {
                return number.longValue();
            }
        } catch (JsonProcessingException ignored) {
            // fall through
        }
        return null;
    }

    private String mergeRejectComment(String inputSnapshot, String comment) {
        try {
            Map<String, Object> map = objectMapper.readValue(inputSnapshot, new TypeReference<>() {});
            map.put("rejectComment", comment);
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return inputSnapshot;
        }
    }

    private static String buildExplanation(GreedyResult result, List<String> warnings) {
        StringBuilder sb = new StringBuilder();
        sb.append("GREEDY variant: ")
                .append(result.assignments().size())
                .append(" assigned, ")
                .append(result.unassigned().size())
                .append(" unassigned.");
        if (!warnings.isEmpty()) {
            sb.append(" ").append(String.join("; ", warnings));
        }
        return sb.toString();
    }
}
