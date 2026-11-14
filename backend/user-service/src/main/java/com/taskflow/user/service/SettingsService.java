package com.taskflow.user.service;

import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.domain.CalculationSettings;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.CalculationSettingsRepository;
import com.taskflow.user.security.SecurityUtils;
import com.taskflow.user.web.dto.SettingsDtos.SettingsResponse;
import com.taskflow.user.web.dto.SettingsDtos.SettingsUpdateRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final short SETTINGS_ID = 1;

    private final CalculationSettingsRepository settingsRepository;
    private final ReferenceCache referenceCache;

    @Transactional(readOnly = true)
    public SettingsResponse get() {
        return referenceCache
                .get(ReferenceCache.SETTINGS_KEY, new TypeReference<SettingsResponse>() {})
                .orElseGet(() -> {
                    SettingsResponse response = toResponse(load());
                    referenceCache.put(ReferenceCache.SETTINGS_KEY, response);
                    return response;
                });
    }

    @Transactional
    public SettingsResponse update(SettingsUpdateRequest request) {
        CalculationSettings settings = load();
        settings.setUsefulTimeFactor(request.usefulTimeFactor());
        settings.setOverloadThreshold(request.overloadThreshold());
        settings.setUnderloadThreshold(request.underloadThreshold());
        settings.setAlpha(request.alpha());
        settings.setBeta(request.beta());
        settings.setGamma(request.gamma());
        settings.setDelta(request.delta());
        settings.setHorizonDays(request.horizonDays());
        settings.setUpdatedAt(Instant.now());
        settings.setUpdatedBy(SecurityUtils.currentUserId());
        SettingsResponse response = toResponse(settingsRepository.save(settings));
        referenceCache.put(ReferenceCache.SETTINGS_KEY, response);
        return response;
    }

    private CalculationSettings load() {
        return settingsRepository
                .findById(SETTINGS_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Calculation settings not found"));
    }

    private SettingsResponse toResponse(CalculationSettings s) {
        return new SettingsResponse(
                s.getUsefulTimeFactor(),
                s.getOverloadThreshold(),
                s.getUnderloadThreshold(),
                s.getAlpha(),
                s.getBeta(),
                s.getGamma(),
                s.getDelta(),
                s.getHorizonDays(),
                s.getUpdatedAt(),
                s.getUpdatedBy(),
                s.getVersion());
    }
}
