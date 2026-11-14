package com.taskflow.user.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.domain.Absence;
import com.taskflow.user.domain.Employee;
import com.taskflow.user.domain.EmployeeSkill;
import com.taskflow.user.domain.Skill;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.AbsenceRepository;
import com.taskflow.user.repository.EmployeeRepository;
import com.taskflow.user.repository.EmployeeSkillRepository;
import com.taskflow.user.repository.SkillRepository;
import com.taskflow.user.web.dto.InternalDtos.AvailabilityAbsence;
import com.taskflow.user.web.dto.InternalDtos.AvailabilitySkill;
import com.taskflow.user.web.dto.InternalDtos.EmployeeAvailabilityResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final AbsenceRepository absenceRepository;
    private final ReferenceCache referenceCache;

    @Transactional(readOnly = true)
    public EmployeeAvailabilityResponse availability(UUID employeeId, LocalDate from, LocalDate to) {
        CapacityService.validateRange(from, to);
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<AvailabilitySkill> skills = referenceCache
                .get(ReferenceCache.skillsKey(employeeId), new TypeReference<List<AvailabilitySkill>>() {})
                .orElseGet(() -> {
                    List<AvailabilitySkill> loaded = loadSkills(employeeId);
                    referenceCache.put(ReferenceCache.skillsKey(employeeId), loaded);
                    return loaded;
                });

        List<AvailabilityAbsence> absences = absenceRepository.findOverlapping(employeeId, from, to).stream()
                .map(this::toAvailabilityAbsence)
                .toList();

        return new EmployeeAvailabilityResponse(employeeId, employee.isActive(), skills, absences);
    }

    private List<AvailabilitySkill> loadSkills(UUID employeeId) {
        List<EmployeeSkill> links = employeeSkillRepository.findByEmployeeId(employeeId);
        Map<UUID, Skill> skillsById = skillRepository.findAllById(
                        links.stream().map(EmployeeSkill::getSkillId).toList())
                .stream()
                .collect(Collectors.toMap(Skill::getId, Function.identity()));
        return links.stream()
                .map(link -> {
                    Skill skill = skillsById.get(link.getSkillId());
                    String name = skill != null ? skill.getName() : null;
                    return new AvailabilitySkill(link.getSkillId(), name, link.getLevel());
                })
                .toList();
    }

    private AvailabilityAbsence toAvailabilityAbsence(Absence absence) {
        return new AvailabilityAbsence(
                absence.getId(), absence.getType(), absence.getStartDate(), absence.getEndDate(), absence.getStatus());
    }
}
