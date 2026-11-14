package com.taskflow.task.web;

import com.taskflow.task.service.ProjectService;
import com.taskflow.task.web.dto.ProjectDtos.AddMemberRequest;
import com.taskflow.task.web.dto.ProjectDtos.CreateProjectRequest;
import com.taskflow.task.web.dto.ProjectDtos.ProjectMemberResponse;
import com.taskflow.task.web.dto.ProjectDtos.ProjectResponse;
import com.taskflow.task.web.dto.ProjectDtos.UpdateProjectRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @GetMapping
  public List<ProjectResponse> list() {
    return projectService.list();
  }

  @GetMapping("/{id}")
  public ProjectResponse get(@PathVariable UUID id) {
    return projectService.get(id);
  }

  @PostMapping
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request) {
    return projectService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('MANAGER')")
  public ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProjectRequest request) {
    return projectService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID id) {
    projectService.delete(id);
  }

  @GetMapping("/{id}/members")
  public List<ProjectMemberResponse> members(@PathVariable UUID id) {
    return projectService.listMembers(id);
  }

  @PostMapping("/{id}/members")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectMemberResponse addMember(
      @PathVariable UUID id, @Valid @RequestBody AddMemberRequest request) {
    return projectService.addMember(id, request);
  }

  @DeleteMapping("/{id}/members/{employeeId}")
  @PreAuthorize("hasRole('MANAGER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeMember(@PathVariable UUID id, @PathVariable UUID employeeId) {
    projectService.removeMember(id, employeeId);
  }
}
