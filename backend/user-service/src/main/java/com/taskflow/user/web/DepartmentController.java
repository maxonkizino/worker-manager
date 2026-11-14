package com.taskflow.user.web;

import com.taskflow.user.service.DepartmentService;
import com.taskflow.user.web.dto.DepartmentDtos.DepartmentRequest;
import com.taskflow.user.web.dto.DepartmentDtos.DepartmentResponse;
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
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<DepartmentResponse> list() {
        return departmentService.findAll();
    }

    @GetMapping("/{id}")
    public DepartmentResponse get(@PathVariable UUID id) {
        return departmentService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse create(@Valid @RequestBody DepartmentRequest request) {
        return departmentService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DepartmentResponse update(@PathVariable UUID id, @Valid @RequestBody DepartmentRequest request) {
        return departmentService.update(id, request);
    }
}
