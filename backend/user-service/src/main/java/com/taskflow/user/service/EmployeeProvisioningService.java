package com.taskflow.user.service;

import com.taskflow.user.domain.CalculationSettings;
import com.taskflow.user.domain.Employee;
import com.taskflow.user.domain.ProcessedEvent;
import com.taskflow.user.domain.WorkSchedule;
import com.taskflow.user.repository.CalculationSettingsRepository;
import com.taskflow.user.repository.EmployeeRepository;
import com.taskflow.user.repository.ProcessedEventRepository;
import com.taskflow.user.repository.WorkScheduleRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.events.user.UserCreatedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeProvisioningService {

    private static final String EVENT_TYPE = "user.created";
    private static final String CONSUMER = "user-service";

    private final EmployeeRepository employeeRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final CalculationSettingsRepository settingsRepository;
    private final ProcessedEventRepository processedEventRepository;

    @Transactional
    public void handleUserCreated(UserCreatedEvent event) {
        UUID eventId = UUID.nameUUIDFromBytes((event.id() + ":" + EVENT_TYPE).getBytes());
        if (processedEventRepository.existsById(eventId)) {
            log.debug("Skip duplicate {}", EVENT_TYPE);
            return;
        }
        if (employeeRepository.existsById(event.id())) {
            markProcessed(eventId);
            return;
        }

        WorkSchedule schedule = workScheduleRepository
                .findByNameIgnoreCase("STANDARD")
                .orElseThrow(() -> new IllegalStateException("STANDARD work schedule is not seeded"));

        CalculationSettings settings = settingsRepository
                .findById((short) 1)
                .orElseThrow(() -> new IllegalStateException("calculation_settings row missing"));

        Employee employee = new Employee();
        employee.setId(event.id());
        employee.setEmail(event.email());
        employee.setFullName(buildFullName(event.firstName(), event.lastName(), event.username()));
        employee.setScheduleId(schedule.getId());
        employee.setUsefulTimeFactor(settings.getUsefulTimeFactor());
        employee.setActive(true);

        employeeRepository.save(employee);
        markProcessed(eventId);
        log.info("Created employee stub for user {}", event.id());
    }

    @Transactional
    public Employee ensure(UUID id, String email, String fullName, String username) {
        return employeeRepository.findById(id).orElseGet(() -> {
            WorkSchedule schedule = workScheduleRepository
                    .findByNameIgnoreCase("STANDARD")
                    .orElseThrow(() -> new IllegalStateException("STANDARD work schedule is not seeded"));
            CalculationSettings settings = settingsRepository
                    .findById((short) 1)
                    .orElseThrow(() -> new IllegalStateException("calculation_settings row missing"));
            Employee employee = new Employee();
            employee.setId(id);
            employee.setEmail(email == null || email.isBlank() ? username + "@taskflow.local" : email.trim().toLowerCase());
            String name = fullName == null ? "" : fullName.trim();
            employee.setFullName(name.isEmpty() ? username : name);
            employee.setScheduleId(schedule.getId());
            employee.setUsefulTimeFactor(settings.getUsefulTimeFactor());
            employee.setActive(true);
            return employeeRepository.save(employee);
        });
    }

    private void markProcessed(UUID eventId) {
        ProcessedEvent processed = new ProcessedEvent();
        processed.setEventId(eventId);
        processed.setEventType(EVENT_TYPE);
        processed.setConsumerName(CONSUMER);
        processedEventRepository.save(processed);
    }

    private static String buildFullName(String firstName, String lastName, String username) {
        String fn = firstName == null ? "" : firstName.trim();
        String ln = lastName == null ? "" : lastName.trim();
        String combined = (fn + " " + ln).trim();
        return combined.isEmpty() ? username : combined;
    }
}
