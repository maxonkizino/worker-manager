package com.taskflow.user.service;

import com.taskflow.user.domain.Skill;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.SkillRepository;
import com.taskflow.user.web.dto.SkillDtos.SkillRequest;
import com.taskflow.user.web.dto.SkillDtos.SkillResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<SkillResponse> findAll() {
        return skillRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SkillResponse get(UUID id) {
        return toResponse(load(id));
    }

    @Transactional
    public SkillResponse create(SkillRequest request) {
        if (skillRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Skill already exists: " + request.name());
        }
        Skill skill = new Skill();
        skill.setId(UUID.randomUUID());
        apply(skill, request);
        return toResponse(skillRepository.save(skill));
    }

    @Transactional
    public SkillResponse update(UUID id, SkillRequest request) {
        Skill skill = load(id);
        if (!skill.getName().equalsIgnoreCase(request.name()) && skillRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Skill already exists: " + request.name());
        }
        apply(skill, request);
        return toResponse(skillRepository.save(skill));
    }

    private void apply(Skill skill, SkillRequest request) {
        skill.setName(request.name().trim());
        skill.setDescription(request.description());
        if (request.active() != null) {
            skill.setActive(request.active());
        }
    }

    private Skill load(UUID id) {
        return skillRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
    }

    private SkillResponse toResponse(Skill s) {
        return new SkillResponse(s.getId(), s.getName(), s.getDescription(), s.isActive(), s.getVersion());
    }
}
