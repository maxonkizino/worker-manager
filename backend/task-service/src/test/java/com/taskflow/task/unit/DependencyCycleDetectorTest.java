package com.taskflow.task.unit;

import static org.assertj.core.api.Assertions.assertThat;

import com.taskflow.task.service.DependencyCycleDetector;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DependencyCycleDetectorTest {

  private final DependencyCycleDetector detector = new DependencyCycleDetector();

  @Test
  void detectsDirectSelfLoop() {
    UUID task = UUID.randomUUID();
    assertThat(detector.wouldCreateCycle(task, task, id -> List.of())).isTrue();
  }

  @Test
  void detectsIndirectCycle() {
    UUID a = UUID.randomUUID();
    UUID b = UUID.randomUUID();
    UUID c = UUID.randomUUID();
    Map<UUID, List<UUID>> graph =
        Map.of(
            b, List.of(a),
            c, List.of(b));
    assertThat(detector.wouldCreateCycle(a, c, graph)).isTrue();
  }

  @Test
  void allowsAcyclicDependency() {
    UUID a = UUID.randomUUID();
    UUID b = UUID.randomUUID();
    UUID c = UUID.randomUUID();
    Map<UUID, List<UUID>> graph = Map.of(b, List.of(a));
    assertThat(detector.wouldCreateCycle(c, b, graph)).isFalse();
  }
}
