package com.taskflow.task.service;

import com.taskflow.task.domain.Project;
import com.taskflow.task.domain.ProjectMember;
import com.taskflow.task.domain.ProjectMemberId;
import com.taskflow.task.domain.enums.ProjectRole;
import com.taskflow.task.domain.enums.ProjectStatus;
import com.taskflow.task.exception.BadRequestException;
import com.taskflow.task.exception.NotFoundException;
import com.taskflow.task.repository.ProjectMemberRepository;
import com.taskflow.task.repository.ProjectRepository;
import com.taskflow.task.security.SecurityUtils;
import com.taskflow.task.web.dto.ProjectDtos;
import com.taskflow.task.web.dto.ProjectDtos.AddMemberRequest;
import com.taskflow.task.web.dto.ProjectDtos.CreateProjectRequest;
import com.taskflow.task.web.dto.ProjectDtos.ProjectMemberResponse;
import com.taskflow.task.web.dto.ProjectDtos.ProjectResponse;
import com.taskflow.task.web.dto.ProjectDtos.UpdateProjectRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final ProjectMemberRepository projectMemberRepository;

  @Transactional(readOnly = true)
  public List<ProjectResponse> list() {
    if (!SecurityUtils.isEmployeeOnly()) {
      return projectRepository.findAll().stream().map(this::toResponse).toList();
    }
    return projectMemberRepository.findById_EmployeeId(SecurityUtils.requireUserId()).stream()
        .map(member -> member.getId().getProjectId())
        .distinct()
        .map(this::load)
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public ProjectResponse get(UUID id) {
    if (SecurityUtils.isEmployeeOnly()
        && !projectMemberRepository.existsByIdProjectIdAndIdEmployeeId(id, SecurityUtils.requireUserId())) {
      throw new AccessDeniedException("Проект доступен только его участникам");
    }
    return toResponse(load(id));
  }

  @Transactional
  public ProjectResponse create(CreateProjectRequest request) {
    validatePeriod(request.startDate(), request.endDate());
    Project project = new Project();
    project.setName(request.name());
    project.setDescription(request.description());
    project.setManagerId(request.managerId());
    project.setStartDate(request.startDate());
    project.setEndDate(request.endDate());
    if (request.status() != null) {
      project.setStatus(request.status());
    }
    project = projectRepository.save(project);
    ProjectMember manager =
        new ProjectMember();
    manager.setId(new ProjectMemberId(project.getId(), request.managerId()));
    manager.setProjectRole(ProjectRole.MANAGER);
    projectMemberRepository.save(manager);
    return toResponse(project);
  }

  @Transactional
  public ProjectResponse update(UUID id, UpdateProjectRequest request) {
    Project project = load(id);
    if (request.name() != null) {
      project.setName(request.name());
    }
    if (request.description() != null) {
      project.setDescription(request.description());
    }
    if (request.managerId() != null) {
      project.setManagerId(request.managerId());
    }
    if (request.startDate() != null) {
      project.setStartDate(request.startDate());
    }
    if (request.endDate() != null) {
      project.setEndDate(request.endDate());
    }
    if (request.status() != null) {
      project.setStatus(request.status());
    }
    validatePeriod(project.getStartDate(), project.getEndDate());
    return toResponse(projectRepository.save(project));
  }

  @Transactional
  public void delete(UUID id) {
    if (!projectRepository.existsById(id)) {
      throw new NotFoundException("Project not found: " + id);
    }
    projectRepository.deleteById(id);
  }

  @Transactional
  public ProjectMemberResponse addMember(UUID projectId, AddMemberRequest request) {
    load(projectId);
    ProjectRole role = request.projectRole() != null ? request.projectRole() : ProjectRole.MEMBER;
    ProjectMember member = new ProjectMember();
    member.setId(new ProjectMemberId(projectId, request.employeeId()));
    member.setProjectRole(role);
    projectMemberRepository.save(member);
    return new ProjectMemberResponse(request.employeeId(), role);
  }

  @Transactional
  public void removeMember(UUID projectId, UUID employeeId) {
    projectMemberRepository.deleteById(new ProjectMemberId(projectId, employeeId));
  }

  @Transactional(readOnly = true)
  public List<ProjectMemberResponse> listMembers(UUID projectId) {
    load(projectId);
    return projectMemberRepository.findByIdProjectId(projectId).stream()
        .map(m -> new ProjectMemberResponse(m.getId().getEmployeeId(), m.getProjectRole()))
        .toList();
  }

  private Project load(UUID id) {
    return projectRepository
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Project not found: " + id));
  }

  private void validatePeriod(java.time.LocalDate start, java.time.LocalDate end) {
    if (end != null && end.isBefore(start)) {
      throw new BadRequestException("endDate must be on or after startDate");
    }
  }

  private ProjectResponse toResponse(Project project) {
    return new ProjectResponse(
        project.getId(),
        project.getName(),
        project.getDescription(),
        project.getManagerId(),
        project.getStartDate(),
        project.getEndDate(),
        project.getStatus(),
        project.getVersion());
  }
}
