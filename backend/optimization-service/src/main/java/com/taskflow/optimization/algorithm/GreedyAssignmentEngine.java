package com.taskflow.optimization.algorithm;

import com.taskflow.optimization.client.dto.CapacityBatchResponse;
import com.taskflow.optimization.client.dto.TaskSnapshotDto;
import com.taskflow.optimization.domain.UnassignedReasonCode;
import com.taskflow.optimization.domain.VariantItemReasonCode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class GreedyAssignmentEngine {

    private static final Map<String, Integer> PRIORITY_ORDER =
            Map.of("CRITICAL", 0, "HIGH", 1, "MEDIUM", 2, "LOW", 3);

    public GreedyResult run(GreedyInput input) {
        List<GreedyAssignment> assignments = new ArrayList<>();
        List<GreedyUnassigned> unassigned = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        if (input.tasks() == null || input.tasks().isEmpty()) {
            notes.add("No tasks in snapshot");
            return new GreedyResult(assignments, unassigned, BigDecimal.ZERO, notes);
        }

        Map<UUID, EmployeeState> employees = buildEmployeeState(input.capacities(), input.memberIds());
        if (employees.isEmpty()) {
            notes.add("No employee capacity data");
            for (TaskSnapshotDto.TaskSnapshotItemDto task : input.tasks()) {
                if (isCandidateTask(task)) {
                    unassigned.add(new GreedyUnassigned(
                            task.id(), UnassignedReasonCode.NO_ELIGIBLE_EMPLOYEE, "No employees available"));
                }
            }
            return new GreedyResult(assignments, unassigned, score(assignments, unassigned), notes);
        }

        Map<UUID, UUID> plannedAssignments = new HashMap<>();
        Set<UUID> doneOrAssigned = collectAlreadyAssigned(input.tasks());

        List<TaskSnapshotDto.TaskSnapshotItemDto> candidates = input.tasks().stream()
                .filter(this::isCandidateTask)
                .sorted(taskComparator())
                .toList();

        for (TaskSnapshotDto.TaskSnapshotItemDto task : candidates) {
            if (isDependencyBlocked(task, input.tasks(), doneOrAssigned, plannedAssignments)) {
                unassigned.add(new GreedyUnassigned(
                        task.id(),
                        UnassignedReasonCode.DEPENDENCY_BLOCKED,
                        "Waiting on prerequisite tasks"));
                continue;
            }

            List<EmployeeState> eligible = findEligibleEmployees(task, employees, input.memberIds());
            if (eligible.isEmpty()) {
                unassigned.add(new GreedyUnassigned(
                        task.id(),
                        UnassignedReasonCode.NO_ELIGIBLE_EMPLOYEE,
                        "No employee matches required skills"));
                continue;
            }

            BigDecimal hours = task.estimatedHours();
            EmployeeState chosen = pickLowestLoad(eligible, hours);
            if (chosen == null) {
                unassigned.add(new GreedyUnassigned(
                        task.id(), UnassignedReasonCode.NO_CAPACITY, "Insufficient capacity on all eligible employees"));
                continue;
            }

            chosen.addLoad(hours);
            plannedAssignments.put(task.id(), chosen.employeeId());
            doneOrAssigned.add(task.id());

            VariantItemReasonCode reason = task.skillRequirements() == null || task.skillRequirements().isEmpty()
                    ? VariantItemReasonCode.INITIAL_ASSIGNMENT
                    : VariantItemReasonCode.SKILL_MATCH;

            assignments.add(new GreedyAssignment(
                    task.id(),
                    chosen.employeeId(),
                    hours,
                    reason,
                    "Assigned to employee with lowest load ("
                            + chosen.loadAfter(hours).setScale(2, RoundingMode.HALF_UP)
                            + " h)"));
        }

        return new GreedyResult(assignments, unassigned, score(assignments, unassigned), notes);
    }

    /**
     * Score used for ranking employees: projected load after assignment (lower is better).
     */
    public BigDecimal assignmentLoadScore(EmployeeState employee, BigDecimal additionalHours) {
        return employee.loadAfter(additionalHours);
    }

    public EmployeeState pickLowestLoad(List<EmployeeState> eligible, BigDecimal hours) {
        return eligible.stream()
                .filter(e -> e.hasCapacityFor(hours))
                .min(Comparator.comparing(e -> assignmentLoadScore(e, hours)))
                .orElse(null);
    }

    /** Exposed for unit tests. */
    public EmployeeState employeeStateFrom(CapacityBatchResponse.EmployeeCapacityDto cap) {
        return EmployeeState.from(cap);
    }

    private boolean isCandidateTask(TaskSnapshotDto.TaskSnapshotItemDto task) {
        if (task == null || task.id() == null) {
            return false;
        }
        if ("CANCELLED".equals(task.status()) || "DONE".equals(task.status())) {
            return false;
        }
        if (task.currentAssignment() != null && task.currentAssignment().employeeId() != null) {
            return false;
        }
        return "CREATED".equals(task.status()) || "ASSIGNED".equals(task.status());
    }

    private Comparator<TaskSnapshotDto.TaskSnapshotItemDto> taskComparator() {
        return Comparator.<TaskSnapshotDto.TaskSnapshotItemDto, Integer>comparing(
                        t -> PRIORITY_ORDER.getOrDefault(nullSafe(t.priority()), 9))
                .thenComparing(t -> t.plannedEnd() == null ? LocalDate.MAX : t.plannedEnd())
                .thenComparing(t -> t.estimatedHours() == null ? BigDecimal.ZERO : t.estimatedHours(), Comparator.reverseOrder());
    }

    private static String nullSafe(String value) {
        return value == null ? "MEDIUM" : value;
    }

    private Set<UUID> collectAlreadyAssigned(List<TaskSnapshotDto.TaskSnapshotItemDto> tasks) {
        Set<UUID> assigned = new HashSet<>();
        for (TaskSnapshotDto.TaskSnapshotItemDto task : tasks) {
            if ("DONE".equals(task.status())) {
                assigned.add(task.id());
            } else if (task.currentAssignment() != null && task.currentAssignment().employeeId() != null) {
                assigned.add(task.id());
            }
        }
        return assigned;
    }

    private boolean isDependencyBlocked(
            TaskSnapshotDto.TaskSnapshotItemDto task,
            List<TaskSnapshotDto.TaskSnapshotItemDto> allTasks,
            Set<UUID> satisfied,
            Map<UUID, UUID> planned) {
        if (task.dependsOnTaskIds() == null || task.dependsOnTaskIds().isEmpty()) {
            return false;
        }
        Map<UUID, TaskSnapshotDto.TaskSnapshotItemDto> byId = new HashMap<>();
        for (TaskSnapshotDto.TaskSnapshotItemDto t : allTasks) {
            byId.put(t.id(), t);
        }
        for (UUID depId : task.dependsOnTaskIds()) {
            TaskSnapshotDto.TaskSnapshotItemDto dep = byId.get(depId);
            if (dep == null) {
                continue;
            }
            if ("DONE".equals(dep.status())) {
                continue;
            }
            if (satisfied.contains(depId) || planned.containsKey(depId)) {
                continue;
            }
            return true;
        }
        return false;
    }

    private List<EmployeeState> findEligibleEmployees(
            TaskSnapshotDto.TaskSnapshotItemDto task,
            Map<UUID, EmployeeState> employees,
            List<UUID> memberIds) {
        Set<UUID> members = memberIds == null ? Set.of() : new HashSet<>(memberIds);
        List<EmployeeState> result = new ArrayList<>();
        for (EmployeeState employee : employees.values()) {
            if (!members.isEmpty() && !members.contains(employee.employeeId())) {
                continue;
            }
            if (matchesSkills(task, employee)) {
                result.add(employee);
            }
        }
        return result;
    }

    private boolean matchesSkills(TaskSnapshotDto.TaskSnapshotItemDto task, EmployeeState employee) {
        if (task.skillRequirements() == null || task.skillRequirements().isEmpty()) {
            return true;
        }
        for (TaskSnapshotDto.SkillRequirementDto req : task.skillRequirements()) {
            Integer level = employee.skills().get(req.skillId());
            if (level == null || level < req.minLevel()) {
                return false;
            }
        }
        return true;
    }

    private Map<UUID, EmployeeState> buildEmployeeState(
            List<CapacityBatchResponse.EmployeeCapacityDto> capacities, List<UUID> memberIds) {
        Map<UUID, EmployeeState> map = new HashMap<>();
        if (capacities == null) {
            return map;
        }
        Set<UUID> members = memberIds == null ? Set.of() : new HashSet<>(memberIds);
        for (CapacityBatchResponse.EmployeeCapacityDto cap : capacities) {
            if (!members.isEmpty() && !members.contains(cap.employeeId())) {
                continue;
            }
            map.put(cap.employeeId(), EmployeeState.from(cap));
        }
        return map;
    }

    private BigDecimal score(List<GreedyAssignment> assignments, List<GreedyUnassigned> unassigned) {
        BigDecimal assigned = BigDecimal.valueOf(assignments.size());
        BigDecimal penalty = BigDecimal.valueOf(unassigned.size()).multiply(BigDecimal.TEN);
        return assigned.subtract(penalty).setScale(4, RoundingMode.HALF_UP);
    }

    public record GreedyInput(
            List<TaskSnapshotDto.TaskSnapshotItemDto> tasks,
            List<CapacityBatchResponse.EmployeeCapacityDto> capacities,
            List<UUID> memberIds) {}

    public record GreedyAssignment(
            UUID taskId,
            UUID employeeId,
            BigDecimal plannedHours,
            VariantItemReasonCode reasonCode,
            String explanation) {}

    public record GreedyUnassigned(UUID taskId, UnassignedReasonCode reasonCode, String explanation) {}

    public record GreedyResult(
            List<GreedyAssignment> assignments,
            List<GreedyUnassigned> unassigned,
            BigDecimal objectiveScore,
            List<String> notes) {}

    public static final class EmployeeState {
        private final UUID employeeId;
        private final BigDecimal capacity;
        private BigDecimal load;
        private final Map<UUID, Integer> skills;

        private EmployeeState(
                UUID employeeId, BigDecimal capacity, BigDecimal load, Map<UUID, Integer> skills) {
            this.employeeId = employeeId;
            this.capacity = capacity;
            this.load = load;
            this.skills = skills;
        }

        static EmployeeState from(CapacityBatchResponse.EmployeeCapacityDto cap) {
            Map<UUID, Integer> skillMap = new HashMap<>();
            if (cap.skills() != null) {
                for (CapacityBatchResponse.EmployeeSkillDto skill : cap.skills()) {
                    skillMap.put(skill.skillId(), skill.level());
                }
            }
            BigDecimal capacity = cap.totalCapacityHours() != null ? cap.totalCapacityHours() : BigDecimal.ZERO;
            BigDecimal load = cap.plannedLoadHours() != null ? cap.plannedLoadHours() : BigDecimal.ZERO;
            return new EmployeeState(cap.employeeId(), capacity, load, skillMap);
        }

        UUID employeeId() {
            return employeeId;
        }

        Map<UUID, Integer> skills() {
            return skills;
        }

        boolean hasCapacityFor(BigDecimal hours) {
            return load.add(hours).compareTo(capacity) <= 0;
        }

        BigDecimal loadAfter(BigDecimal hours) {
            return load.add(hours);
        }

        void addLoad(BigDecimal hours) {
            load = load.add(hours);
        }
    }
}
