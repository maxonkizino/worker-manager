package com.taskflow.optimization.controller;

import com.taskflow.optimization.dto.CreateProposalRequest;
import com.taskflow.optimization.dto.CreateProposalResponse;
import com.taskflow.optimization.dto.ProposalDetailResponse;
import com.taskflow.optimization.dto.ProposalSummaryResponse;
import com.taskflow.optimization.dto.RejectProposalRequest;
import com.taskflow.optimization.security.RequestUser;
import com.taskflow.optimization.security.RequestUserContext;
import com.taskflow.optimization.service.ProposalService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/optimization/proposals")
@RequiredArgsConstructor
public class OptimizationProposalController {

    private final ProposalService proposalService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateProposalResponse create(@Valid @RequestBody CreateProposalRequest request) {
        requireManager();
        return proposalService.create(request);
    }

    @GetMapping("/{id}")
    public ProposalDetailResponse getById(@PathVariable UUID id) {
        requireManager();
        return proposalService.getById(id);
    }

    @GetMapping
    public List<ProposalSummaryResponse> list(@RequestParam UUID projectId) {
        requireManager();
        return proposalService.listByProject(projectId);
    }

    @PostMapping("/{id}/apply")
    public ProposalDetailResponse apply(@PathVariable UUID id) {
        requireManager();
        return proposalService.apply(id);
    }

    @PostMapping("/{id}/reject")
    public ProposalDetailResponse reject(@PathVariable UUID id, @Valid @RequestBody RejectProposalRequest request) {
        requireManager();
        return proposalService.reject(id, request);
    }

    private static void requireManager() {
        RequestUser user = RequestUserContext.get();
        boolean manager = user != null && user.roles().stream().anyMatch(role ->
                role.equals("ROLE_MANAGER") || role.equals("MANAGER"));
        if (!manager) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Недостаточно прав");
        }
    }
}
