package com.taskflow.user.web.dto;

import com.taskflow.user.domain.enums.PreferredChannel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class EmployeeDtos {

    private EmployeeDtos() {}

    public record EmployeeRequest(
            @NotNull UUID id,
            @NotBlank @Size(max = 200) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @Size(max = 120) String position,
            UUID departmentId,
            @NotNull UUID scheduleId,
            BigDecimal usefulTimeFactor,
            Boolean active,
            Long telegramChatId,
            PreferredChannel preferredChannel) {}

    public record ProfileUpdateRequest(
            @NotBlank @Size(max = 200) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @Size(max = 120) String position,
            Long telegramChatId,
            @NotNull PreferredChannel preferredChannel) {}

    public record AvatarPresetRequest(@Size(max = 40) String preset) {}

    public record EmployeeUpdateRequest(
            @NotBlank @Size(max = 200) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @Size(max = 120) String position,
            UUID departmentId,
            @NotNull UUID scheduleId,
            BigDecimal usefulTimeFactor,
            Boolean active,
            Long telegramChatId,
            PreferredChannel preferredChannel) {}

    public record EmployeeSkillItem(
            @NotNull UUID skillId, @NotNull @Min(0) @Max(5) Short level) {}

    public record EmployeeSkillsRequest(@NotEmpty List<@Valid EmployeeSkillItem> skills) {}

    public record EmployeeResponse(
            UUID id,
            String fullName,
            String email,
            String position,
            UUID departmentId,
            UUID scheduleId,
            BigDecimal usefulTimeFactor,
            boolean active,
            Long telegramChatId,
            PreferredChannel preferredChannel,
            String avatarPreset,
            boolean customAvatar,
            int avatarRevision,
            Long version,
            Double avatarZoom,
            Double avatarOffsetX,
            Double avatarOffsetY,
            boolean avatarSource,
            boolean hasAvatarPhoto) {}

    public record CapacityResponse(UUID employeeId, java.time.LocalDate from, java.time.LocalDate to, BigDecimal capacityHours) {}
}
