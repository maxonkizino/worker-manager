package com.taskflow.analytics.service;

import com.taskflow.analytics.client.UserCapacityClient;
import com.taskflow.analytics.domain.TaskFact;
import com.taskflow.analytics.domain.WorkloadSnapshot;
import com.taskflow.analytics.repository.TaskFactRepository;
import com.taskflow.analytics.repository.TimeEntryFactRepository;
import com.taskflow.analytics.repository.WorkloadSnapshotRepository;
import com.taskflow.analytics.web.dto.EmployeeLoadDto;
import com.taskflow.analytics.web.dto.PersonalLoadDto;
import com.taskflow.analytics.web.dto.TeamLoadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkloadService {

    private static final List<String> TERMINAL = List.of("DONE", "CANCELLED");

    private final WorkloadSnapshotRepository workloadSnapshotRepository;
    private final TaskFactRepository taskFactRepository;
    private final TimeEntryFactRepository timeEntryFactRepository;
    private final UserCapacityClient userCapacityClient;

    @Transactional(readOnly = true)
    public TeamLoadResponse teamLoad(LocalDate from, LocalDate to, UUID projectId) {
        List<WorkloadSnapshot> snapshots = workloadSnapshotRepository.findInRange(from, to);
        if (!snapshots.isEmpty()) {
            Map<UUID, AggregatedLoad> aggregated = aggregateSnapshots(snapshots);
            return buildTeamResponse(from, to, aggregated);
        }
        return computeTeamFromTasks(from, to, projectId);
    }

    @Transactional(readOnly = true)
    public PersonalLoadDto myLoad(UUID employeeId, LocalDate from, LocalDate to) {
        List<WorkloadSnapshot> mine = workloadSnapshotRepository.findByEmployeeIdAndSnapshotDateBetween(
                employeeId, from, to);
        if (!mine.isEmpty()) {
            BigDecimal planned = mine.stream()
                    .map(WorkloadSnapshot::getPlannedHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal actual = mine.stream()
                    .map(WorkloadSnapshot::getActualHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal capacity = mine.stream()
                    .map(WorkloadSnapshot::getCapacityHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return new PersonalLoadDto(employeeId, from, to, planned, actual, capacity, utilization(planned, capacity));
        }
        List<TaskFact> tasks = taskFactRepository.findByAssigneeIdAndStatusNotIn(employeeId, TERMINAL);
        BigDecimal planned = tasks.stream()
                .map(TaskFact::getEstimatedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actual = timeEntryFactRepository.sumHoursForEmployee(employeeId, from, to);
        BigDecimal capacity = userCapacityClient.totalCapacity(employeeId, from, to);
        return new PersonalLoadDto(employeeId, from, to, planned, actual, capacity, utilization(planned, capacity));
    }

    @Transactional
    public void recalculateForEmployee(UUID employeeId, LocalDate onDate) {
        List<TaskFact> tasks = taskFactRepository.findByAssigneeIdAndStatusNotIn(employeeId, TERMINAL);
        BigDecimal planned = tasks.stream()
                .map(TaskFact::getEstimatedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actual = timeEntryFactRepository.sumHoursForEmployee(employeeId, onDate, onDate);
        BigDecimal capacity = userCapacityClient.totalCapacity(employeeId, onDate, onDate);

        WorkloadSnapshot snapshot = workloadSnapshotRepository
                .findByEmployeeIdAndSnapshotDate(employeeId, onDate)
                .orElseGet(() -> {
                    WorkloadSnapshot created = new WorkloadSnapshot();
                    created.setEmployeeId(employeeId);
                    created.setSnapshotDate(onDate);
                    return created;
                });
        snapshot.setCapacityHours(capacity);
        snapshot.setPlannedHours(planned);
        snapshot.setActualHours(actual);
        snapshot.setUtilization(utilization(planned, capacity));
        workloadSnapshotRepository.save(snapshot);
    }

    private TeamLoadResponse computeTeamFromTasks(LocalDate from, LocalDate to, UUID projectId) {
        List<TaskFact> tasks = taskFactRepository.findActiveInRange(from, to, projectId);
        Map<UUID, AggregatedLoad> byEmployee = new HashMap<>();
        for (TaskFact task : tasks) {
            if (task.getAssigneeId() == null) {
                continue;
            }
            byEmployee
                    .computeIfAbsent(task.getAssigneeId(), id -> new AggregatedLoad())
                    .addPlanned(task.getEstimatedHours());
        }
        for (UUID employeeId : byEmployee.keySet()) {
            BigDecimal actual = timeEntryFactRepository.sumHoursForEmployee(employeeId, from, to);
            BigDecimal capacity = userCapacityClient.totalCapacity(employeeId, from, to);
            AggregatedLoad load = byEmployee.get(employeeId);
            load.setActual(actual);
            load.setCapacity(capacity);
            load.setUtilization(utilization(load.planned, capacity));
        }
        return buildTeamResponse(from, to, byEmployee);
    }

    private static Map<UUID, AggregatedLoad> aggregateSnapshots(List<WorkloadSnapshot> snapshots) {
        Map<UUID, AggregatedLoad> map = new HashMap<>();
        for (WorkloadSnapshot snapshot : snapshots) {
            map.computeIfAbsent(snapshot.getEmployeeId(), id -> new AggregatedLoad())
                    .merge(snapshot);
        }
        return map;
    }

    private static TeamLoadResponse buildTeamResponse(
            LocalDate from, LocalDate to, Map<UUID, AggregatedLoad> aggregated) {
        List<EmployeeLoadDto> members = new ArrayList<>();
        for (Map.Entry<UUID, AggregatedLoad> entry : aggregated.entrySet()) {
            AggregatedLoad load = entry.getValue();
            members.add(new EmployeeLoadDto(
                    entry.getKey(),
                    load.planned,
                    load.actual,
                    load.capacity,
                    load.utilization));
        }
        return new TeamLoadResponse(from, to, members);
    }

    private static BigDecimal utilization(BigDecimal planned, BigDecimal capacity) {
        if (capacity == null || capacity.signum() == 0) {
            return null;
        }
        return planned.divide(capacity, 4, RoundingMode.HALF_UP);
    }

    private static final class AggregatedLoad {
        private BigDecimal planned = BigDecimal.ZERO;
        private BigDecimal actual = BigDecimal.ZERO;
        private BigDecimal capacity = BigDecimal.ZERO;
        private BigDecimal utilization;

        void addPlanned(BigDecimal hours) {
            if (hours != null) {
                planned = planned.add(hours);
            }
        }

        void setActual(BigDecimal actual) {
            this.actual = Objects.requireNonNullElse(actual, BigDecimal.ZERO);
        }

        void setCapacity(BigDecimal capacity) {
            this.capacity = Objects.requireNonNullElse(capacity, BigDecimal.ZERO);
        }

        void setUtilization(BigDecimal utilization) {
            this.utilization = utilization;
        }

        void merge(WorkloadSnapshot snapshot) {
            planned = planned.add(snapshot.getPlannedHours());
            actual = actual.add(snapshot.getActualHours());
            capacity = capacity.add(snapshot.getCapacityHours());
            utilization = utilization(planned, capacity);
        }
    }
}
