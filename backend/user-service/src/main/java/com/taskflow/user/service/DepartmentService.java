package com.taskflow.user.service;

import com.taskflow.user.domain.Department;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.DepartmentRepository;
import com.taskflow.user.web.dto.DepartmentDtos.DepartmentRequest;
import com.taskflow.user.web.dto.DepartmentDtos.DepartmentResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> findAll() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse get(UUID id) {
        return toResponse(load(id));
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Department already exists: " + request.name());
        }
        Department department = new Department();
        department.setId(UUID.randomUUID());
        apply(department, request);
        return toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = load(id);
        if (!department.getName().equalsIgnoreCase(request.name())
                && departmentRepository.existsByNameIgnoreCase(request.name())) {
            throw new ConflictException("Department already exists: " + request.name());
        }
        apply(department, request);
        return toResponse(departmentRepository.save(department));
    }

    private void apply(Department department, DepartmentRequest request) {
        department.setName(request.name().trim());
        department.setDescription(request.description());
        department.setHeadEmployeeId(request.headEmployeeId());
    }

    private Department load(UUID id) {
        return departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    private DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(d.getId(), d.getName(), d.getDescription(), d.getHeadEmployeeId(), d.getVersion());
    }
}
