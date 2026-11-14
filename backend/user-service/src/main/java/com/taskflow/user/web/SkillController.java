package com.taskflow.user.web;

import com.taskflow.user.service.SkillService;
import com.taskflow.user.web.dto.SkillDtos.SkillRequest;
import com.taskflow.user.web.dto.SkillDtos.SkillResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public List<SkillResponse> list() {
        return skillService.findAll();
    }

    @GetMapping("/{id}")
    public SkillResponse get(@PathVariable UUID id) {
        return skillService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse create(@Valid @RequestBody SkillRequest request) {
        return skillService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SkillResponse update(@PathVariable UUID id, @Valid @RequestBody SkillRequest request) {
        return skillService.update(id, request);
    }
}
