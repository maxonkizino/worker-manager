package com.taskflow.user.web.dto;

import com.taskflow.user.domain.enums.AbsenceStatus;
import com.taskflow.user.domain.enums.AbsenceType;
import com.taskflow.user.web.dto.SettingsDtos.SettingsResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class InternalDtos {

    private InternalDtos() {}

    public record AvailabilitySkill(UUID skillId, String skillName, Short level) {}

    public record AvailabilityAbsence(
            UUID id, AbsenceType type, LocalDate startDate, LocalDate endDate, AbsenceStatus status) {}

    public record EmployeeAvailabilityResponse(
            UUID employeeId, boolean active, List<AvailabilitySkill> skills, List<AvailabilityAbsence> absences) {}

    public record BatchCapacityRequest(
            @NotEmpty List<UUID> employeeIds, @NotNull LocalDate from, @NotNull LocalDate to) {}

    public record BatchCapacityResponse(Map<UUID, BigDecimal> capacities) {}

    public record InternalSettingsResponse(SettingsResponse settings) {}
}
