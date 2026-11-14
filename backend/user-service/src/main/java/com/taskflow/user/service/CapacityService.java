package com.taskflow.user.service;

import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.CapacityRepository;
import com.taskflow.user.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CapacityService {

    private final CapacityRepository capacityRepository;
    private final EmployeeRepository employeeRepository;
    private final ReferenceCache referenceCache;

    @Transactional(readOnly = true)
    public BigDecimal employeeCapacity(UUID employeeId, LocalDate from, LocalDate to) {
        validateRange(from, to);
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found: " + employeeId);
        }
        String key = ReferenceCache.capacityKey(employeeId, from, to);
        Optional<String> cached = referenceCache == null ? Optional.empty() : referenceCache.get(key);
        if (cached != null && cached.isPresent()) {
            return new BigDecimal(cached.get());
        }
        BigDecimal hours = capacityRepository.sumCapacityHours(employeeId, from, to);
        storeCapacity(employeeId, key, hours);
        return hours;
    }

    @Transactional(readOnly = true)
    public Map<UUID, BigDecimal> batchCapacity(Collection<UUID> employeeIds, LocalDate from, LocalDate to) {
        validateRange(from, to);
        Map<UUID, BigDecimal> result = new HashMap<>();
        List<UUID> missing = new ArrayList<>();
        for (UUID employeeId : employeeIds) {
            String key = ReferenceCache.capacityKey(employeeId, from, to);
            Optional<String> cached = referenceCache == null ? Optional.empty() : referenceCache.get(key);
            if (cached != null && cached.isPresent()) {
                result.put(employeeId, new BigDecimal(cached.get()));
            } else {
                missing.add(employeeId);
            }
        }
        if (!missing.isEmpty()) {
            capacityRepository.sumCapacityHoursBatch(missing, from, to).forEach((employeeId, hours) -> {
                result.put(employeeId, hours);
                storeCapacity(employeeId, ReferenceCache.capacityKey(employeeId, from, to), hours);
            });
        }
        return result;
    }

    private void storeCapacity(UUID employeeId, String key, BigDecimal hours) {
        if (referenceCache == null) {
            return;
        }
        referenceCache.putText(key, hours.toPlainString());
        referenceCache.rememberCapacity(employeeId, key);
    }

    static void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || to.isBefore(from)) {
            throw new IllegalArgumentException("Invalid date range");
        }
    }
}
