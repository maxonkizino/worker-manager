package com.taskflow.user.web;

import com.taskflow.user.service.AvailabilityService;
import com.taskflow.user.service.CapacityService;
import com.taskflow.user.service.SettingsService;
import com.taskflow.user.web.dto.InternalDtos.BatchCapacityRequest;
import com.taskflow.user.web.dto.InternalDtos.BatchCapacityResponse;
import com.taskflow.user.web.dto.InternalDtos.EmployeeAvailabilityResponse;
import com.taskflow.user.web.dto.InternalDtos.InternalSettingsResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalController {

    private final AvailabilityService availabilityService;
    private final CapacityService capacityService;
    private final SettingsService settingsService;

    @GetMapping("/employees/{id}/availability")
    public EmployeeAvailabilityResponse availability(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return availabilityService.availability(id, from, to);
    }

    @PostMapping("/capacity/batch")
    public BatchCapacityResponse batchCapacity(@Valid @RequestBody BatchCapacityRequest request) {
        return new BatchCapacityResponse(
                capacityService.batchCapacity(request.employeeIds(), request.from(), request.to()));
    }

    @GetMapping("/settings")
    public InternalSettingsResponse settings() {
        return new InternalSettingsResponse(settingsService.get());
    }
}
