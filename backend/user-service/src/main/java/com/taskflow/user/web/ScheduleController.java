package com.taskflow.user.web;

import com.taskflow.user.service.WorkScheduleService;
import com.taskflow.user.web.dto.ScheduleDtos.ScheduleRequest;
import com.taskflow.user.web.dto.ScheduleDtos.ScheduleResponse;
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
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final WorkScheduleService workScheduleService;

    @GetMapping
    public List<ScheduleResponse> list() {
        return workScheduleService.findAll();
    }

    @GetMapping("/{id}")
    public ScheduleResponse get(@PathVariable UUID id) {
        return workScheduleService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleResponse create(@Valid @RequestBody ScheduleRequest request) {
        return workScheduleService.create(request);
    }
}
