package com.taskflow.user.service;

import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.domain.Absence;
import com.taskflow.user.domain.enums.AbsenceStatus;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.outbox.OutboxService;
import com.taskflow.user.repository.AbsenceRepository;
import com.taskflow.user.repository.EmployeeRepository;
import com.taskflow.user.security.SecurityUtils;
import com.taskflow.user.web.dto.AbsenceDtos.AbsenceRequest;
import com.taskflow.user.web.dto.AbsenceDtos.AbsenceResponse;
import com.taskflow.user.web.dto.AbsenceDtos.DecisionRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final EmployeeRepository employeeRepository;
    private final OutboxService outboxService;
    private final ReferenceCache referenceCache;

    @Transactional(readOnly = true)
    public List<AbsenceResponse> findAll() {
        if (SecurityUtils.hasRole("MANAGER")) {
            return absenceRepository.findAll().stream().map(this::toResponse).toList();
        }
        return absenceRepository.findByEmployeeId(currentEmployeeId()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AbsenceResponse create(AbsenceRequest request) {
        UUID employeeId = currentEmployeeId();
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }
        Absence absence = new Absence();
        absence.setId(UUID.randomUUID());
        absence.setEmployeeId(employeeId);
        absence.setType(request.type());
        absence.setStartDate(request.startDate());
        absence.setEndDate(request.endDate());
        absence.setComment(request.comment());
        absence.setStatus(AbsenceStatus.PENDING);
        absence = absenceRepository.save(absence);
        outboxService.enqueue("Absence", absence.getId(), "absence.requested", absencePayload(absence, employeeId));
        return toResponse(absence);
    }

    @Transactional
    public AbsenceResponse approve(UUID id, DecisionRequest request) {
        return decide(id, AbsenceStatus.APPROVED, request);
    }

    @Transactional
    public AbsenceResponse reject(UUID id, DecisionRequest request) {
        return decide(id, AbsenceStatus.REJECTED, request);
    }

    private AbsenceResponse decide(UUID id, AbsenceStatus status, DecisionRequest request) {
        Absence absence = absenceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Absence not found"));
        if (absence.getStatus() != AbsenceStatus.PENDING) {
            throw new ConflictException("Absence is already " + absence.getStatus());
        }
        absence.setStatus(status);
        absence.setDecidedAt(Instant.now());
        UUID actorId = SecurityUtils.currentUserId();
        absence.setDecidedBy(actorId);
        absence.setDecisionComment(request != null ? request.decisionComment() : null);
        absence = absenceRepository.save(absence);
        referenceCache.evictCapacity(absence.getEmployeeId());
        outboxService.enqueue("Absence", absence.getId(), "absence.decided", absencePayload(absence, actorId));
        return toResponse(absence);
    }

    private static UUID currentEmployeeId() {
        UUID employeeId = SecurityUtils.currentUserId();
        if (employeeId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Требуется авторизация");
        }
        return employeeId;
    }

    private static Map<String, Object> absencePayload(Absence absence, UUID actorId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("absenceId", absence.getId().toString());
        payload.put("employeeId", absence.getEmployeeId().toString());
        payload.put("type", absence.getType().name());
        payload.put("status", absence.getStatus().name());
        payload.put("startDate", absence.getStartDate().toString());
        payload.put("endDate", absence.getEndDate().toString());
        if (actorId != null) {
            payload.put("actorId", actorId.toString());
        }
        return payload;
    }

    private AbsenceResponse toResponse(Absence a) {
        return new AbsenceResponse(
                a.getId(),
                a.getEmployeeId(),
                a.getType(),
                a.getStartDate(),
                a.getEndDate(),
                a.getStatus(),
                a.getComment(),
                a.getDecidedBy(),
                a.getDecidedAt(),
                a.getDecisionComment(),
                a.getVersion());
    }
}
