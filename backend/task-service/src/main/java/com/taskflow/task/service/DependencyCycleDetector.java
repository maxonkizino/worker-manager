package com.taskflow.task.service;

import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import org.springframework.stereotype.Component;

@Component
public class DependencyCycleDetector {

  /**
   * Returns true if adding edge {@code taskId} -> {@code dependsOnTaskId}
   * would create a cycle (i.e. {@code dependsOnTaskId} already depends on {@code taskId}).
   */
  public boolean wouldCreateCycle(
      UUID taskId,
      UUID dependsOnTaskId,
      Function<UUID, List<UUID>> predecessorProvider) {
    if (taskId.equals(dependsOnTaskId)) {
      return true;
    }
  Set<UUID> visited = new HashSet<>();
  Queue<UUID> queue = new ArrayDeque<>();
  queue.add(dependsOnTaskId);
  while (!queue.isEmpty()) {
    UUID current = queue.poll();
    if (!visited.add(current)) {
      continue;
    }
    if (current.equals(taskId)) {
      return true;
    }
    for (UUID predecessor : predecessorProvider.apply(current)) {
      queue.add(predecessor);
    }
  }
  return false;
  }

  public boolean wouldCreateCycle(
      UUID taskId,
      UUID dependsOnTaskId,
      Map<UUID, List<UUID>> predecessorsByTask) {
    return wouldCreateCycle(
        taskId, dependsOnTaskId, id -> predecessorsByTask.getOrDefault(id, List.of()));
  }
}
