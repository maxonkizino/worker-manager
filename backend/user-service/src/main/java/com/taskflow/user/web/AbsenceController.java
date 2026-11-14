package com.taskflow.user.web;

import com.taskflow.user.service.AbsenceService;
import com.taskflow.user.web.dto.AbsenceDtos.AbsenceRequest;
import com.taskflow.user.web.dto.AbsenceDtos.AbsenceResponse;
import com.taskflow.user.web.dto.AbsenceDtos.DecisionRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
public class AbsenceController {

    private final AbsenceService absenceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<AbsenceResponse> list() {
        return absenceService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AbsenceResponse create(@Valid @RequestBody AbsenceRequest request) {
        return absenceService.create(request);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public AbsenceResponse approve(@PathVariable UUID id, @RequestBody(required = false) DecisionRequest request) {
        return absenceService.approve(id, request);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public AbsenceResponse reject(@PathVariable UUID id, @RequestBody(required = false) DecisionRequest request) {
        return absenceService.reject(id, request);
    }
}
