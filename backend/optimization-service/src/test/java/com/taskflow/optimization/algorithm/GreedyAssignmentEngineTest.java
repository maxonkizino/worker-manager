package com.taskflow.optimization.algorithm;

import static org.assertj.core.api.Assertions.assertThat;

import com.taskflow.optimization.client.dto.CapacityBatchResponse;
import com.taskflow.optimization.client.dto.TaskSnapshotDto;
import com.taskflow.optimization.domain.VariantItemReasonCode;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GreedyAssignmentEngineTest {

    private GreedyAssignmentEngine engine;

    private UUID skillJava;
    private UUID employeeLowLoad;
    private UUID employeeHighLoad;
    private UUID taskId;

    @BeforeEach
    void setUp() {
        engine = new GreedyAssignmentEngine();
        skillJava = UUID.fromString("11111111-1111-1111-1111-111111111111");
        employeeLowLoad = UUID.fromString("22222222-2222-2222-2222-222222222222");
        employeeHighLoad = UUID.fromString("33333333-3333-3333-3333-333333333333");
        taskId = UUID.fromString("44444444-4444-4444-4444-444444444444");
    }

    @Test
    void picksEmployeeWithLowerProjectedLoadAmongSkillMatches() {
        List<CapacityBatchResponse.EmployeeCapacityDto> capacities = List.of(
                employee(employeeHighLoad, "40", "30", skillJava, 5),
                employee(employeeLowLoad, "40", "5", skillJava, 4));

        TaskSnapshotDto.TaskSnapshotItemDto task = new TaskSnapshotDto.TaskSnapshotItemDto(
                taskId,
                "CREATED",
                "HIGH",
                new BigDecimal("8.00"),
                null,
                null,
                List.of(new TaskSnapshotDto.SkillRequirementDto(skillJava, 3)),
                List.of(),
                null);

        GreedyAssignmentEngine.GreedyResult result = engine.run(new GreedyAssignmentEngine.GreedyInput(
                List.of(task), capacities, List.of(employeeLowLoad, employeeHighLoad)));

        assertThat(result.assignments()).hasSize(1);
        assertThat(result.assignments().getFirst().employeeId()).isEqualTo(employeeLowLoad);
        assertThat(result.assignments().getFirst().reasonCode()).isEqualTo(VariantItemReasonCode.SKILL_MATCH);
    }

    @Test
    void assignmentLoadScoreReflectsCurrentLoadPlusTaskHours() {
        var lowLoad = engine.employeeStateFrom(employee(employeeLowLoad, "40", "10", skillJava, 3));
        var highLoad = engine.employeeStateFrom(employee(employeeHighLoad, "40", "25", skillJava, 3));
        BigDecimal hours = new BigDecimal("5");

        assertThat(engine.assignmentLoadScore(lowLoad, hours)).isLessThan(engine.assignmentLoadScore(highLoad, hours));
        assertThat(engine.pickLowestLoad(List.of(lowLoad, highLoad), hours).employeeId()).isEqualTo(employeeLowLoad);
    }

    private static CapacityBatchResponse.EmployeeCapacityDto employee(
            UUID id, String capacity, String load, UUID skillId, int level) {
        return new CapacityBatchResponse.EmployeeCapacityDto(
                id,
                new BigDecimal(capacity),
                new BigDecimal(load),
                List.of(new CapacityBatchResponse.EmployeeSkillDto(skillId, level)));
    }
}
