package com.taskflow.user.repository;

import com.taskflow.user.domain.CalculationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalculationSettingsRepository extends JpaRepository<CalculationSettings, Short> {
}
