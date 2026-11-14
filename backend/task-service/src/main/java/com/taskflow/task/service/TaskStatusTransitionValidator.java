package com.taskflow.task.service;

import com.taskflow.task.domain.enums.TaskStatus;
import com.taskflow.task.exception.InvalidStatusTransitionException;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class TaskStatusTransitionValidator {

  private static final Map<TaskStatus, Set<TaskStatus>> ALLOWED = new EnumMap<>(TaskStatus.class);

  static {
    ALLOWED.put(TaskStatus.CREATED, EnumSet.of(TaskStatus.ASSIGNED, TaskStatus.CANCELLED));
    ALLOWED.put(
        TaskStatus.ASSIGNED,
        EnumSet.of(TaskStatus.CREATED, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED));
    ALLOWED.put(
        TaskStatus.IN_PROGRESS,
        EnumSet.of(TaskStatus.ASSIGNED, TaskStatus.DONE, TaskStatus.CANCELLED));
    ALLOWED.put(TaskStatus.DONE, EnumSet.noneOf(TaskStatus.class));
    ALLOWED.put(TaskStatus.CANCELLED, EnumSet.noneOf(TaskStatus.class));
  }

  public void validate(TaskStatus from, TaskStatus to) {
    if (from == to) {
      return;
    }
    Set<TaskStatus> targets = ALLOWED.getOrDefault(from, Set.of());
    if (!targets.contains(to)) {
      throw new InvalidStatusTransitionException(
          "Cannot transition task from " + from + " to " + to);
    }
  }
}
