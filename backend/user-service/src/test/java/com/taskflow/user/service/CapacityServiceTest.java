package com.taskflow.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.CapacityRepository;
import com.taskflow.user.repository.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CapacityServiceTest {

    @Mock
    private CapacityRepository capacityRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ReferenceCache referenceCache;

    @InjectMocks
    private CapacityService capacityService;

    @Test
    void employeeCapacity_sumsRepositoryResult() {
        UUID employeeId = UUID.randomUUID();
        LocalDate from = LocalDate.of(2026, 1, 6);
        LocalDate to = LocalDate.of(2026, 1, 10);
        when(employeeRepository.existsById(employeeId)).thenReturn(true);
        when(capacityRepository.sumCapacityHours(employeeId, from, to)).thenReturn(new BigDecimal("32.00"));

        BigDecimal result = capacityService.employeeCapacity(employeeId, from, to);

        assertThat(result).isEqualByComparingTo("32.00");
        verify(capacityRepository).sumCapacityHours(eq(employeeId), eq(from), eq(to));
    }

    @Test
    void employeeCapacity_unknownEmployee() {
        UUID employeeId = UUID.randomUUID();
        when(employeeRepository.existsById(employeeId)).thenReturn(false);

        assertThatThrownBy(() -> capacityService.employeeCapacity(employeeId, LocalDate.now(), LocalDate.now()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void batchCapacity_returnsMapFromRepository() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        LocalDate from = LocalDate.of(2026, 2, 1);
        LocalDate to = LocalDate.of(2026, 2, 7);
        when(capacityRepository.sumCapacityHoursBatch(any(), eq(from), eq(to)))
                .thenReturn(Map.of(id1, new BigDecimal("40"), id2, BigDecimal.ZERO));

        Map<UUID, BigDecimal> result = capacityService.batchCapacity(List.of(id1, id2), from, to);

        assertThat(result).containsEntry(id1, new BigDecimal("40")).containsEntry(id2, BigDecimal.ZERO);
    }

    @Test
    void validateRange_rejectsInvertedPeriod() {
        assertThatThrownBy(() -> capacityService.employeeCapacity(
                        UUID.randomUUID(), LocalDate.of(2026, 2, 10), LocalDate.of(2026, 2, 1)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
