package com.taskflow.task.web;

import com.taskflow.task.service.InternalTaskService;
import com.taskflow.task.web.dto.InternalDtos.BatchAssignmentsRequest;
import com.taskflow.task.web.dto.InternalDtos.BatchAssignmentsResponse;
import com.taskflow.task.web.dto.InternalDtos.SnapshotResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalController {

  private final InternalTaskService internalTaskService;

  @GetMapping("/snapshot")
  public SnapshotResponse snapshot(
      @RequestParam UUID projectId,
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to) {
    return internalTaskService.snapshot(projectId, from, to);
  }

  @PostMapping("/assignments/batch")
  public BatchAssignmentsResponse batchAssignments(@Valid @RequestBody BatchAssignmentsRequest request) {
    return internalTaskService.applyBatch(request);
  }
}
