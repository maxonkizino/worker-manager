package com.taskflow.analytics.service;

import com.taskflow.analytics.domain.TaskFact;
import com.taskflow.analytics.repository.TaskFactRepository;
import com.taskflow.analytics.web.dto.DeadlineReportItemDto;
import com.taskflow.analytics.web.dto.DeadlineReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TaskFactRepository taskFactRepository;

    @Transactional(readOnly = true)
    public DeadlineReportResponse deadlines(LocalDate from, LocalDate to) {
        List<TaskFact> tasks = taskFactRepository.findDeadlineReport(from, to);
        List<DeadlineReportItemDto> items = tasks.stream()
                .map(t -> new DeadlineReportItemDto(
                        t.getTaskId(),
                        t.getProjectId(),
                        t.getAssigneeId(),
                        t.getStatus(),
                        t.getPriority(),
                        t.getPlannedEnd(),
                        t.getEstimatedHours(),
                        t.getActualHours()))
                .toList();
        return new DeadlineReportResponse(from, to, items);
    }
}
