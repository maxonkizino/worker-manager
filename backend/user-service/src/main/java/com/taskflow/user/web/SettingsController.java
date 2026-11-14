package com.taskflow.user.web;

import com.taskflow.user.service.SettingsService;
import com.taskflow.user.web.dto.SettingsDtos.SettingsResponse;
import com.taskflow.user.web.dto.SettingsDtos.SettingsUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public SettingsResponse get() {
        return settingsService.get();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SettingsResponse update(@Valid @RequestBody SettingsUpdateRequest request) {
        return settingsService.update(request);
    }
}
