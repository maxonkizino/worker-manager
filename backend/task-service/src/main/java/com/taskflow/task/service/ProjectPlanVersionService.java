package com.taskflow.task.service;

import com.taskflow.task.exception.ConflictException;
import com.taskflow.task.repository.ProjectRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectPlanVersionService {

  private final ProjectRepository projectRepository;

  @Transactional
  public void bumpDataVersion(UUID projectId) {
    projectRepository.incrementDataVersion(projectId);
  }

  public long getDataVersion(UUID projectId) {
    return projectRepository.findDataVersion(projectId);
  }

  public void assertDataVersion(UUID projectId, long expected) {
    long actual = getDataVersion(projectId);
    if (actual != expected) {
      throw new ConflictException(
          "Project data version mismatch: expected " + expected + ", actual " + actual);
    }
  }
}
