package com.taskflow.user.service;

import com.taskflow.user.domain.WorkSchedule;
import com.taskflow.user.domain.WorkScheduleDay;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.WorkScheduleRepository;
import com.taskflow.user.web.dto.ScheduleDtos.ScheduleDayRequest;
import com.taskflow.user.web.dto.ScheduleDtos.ScheduleRequest;
import com.taskflow.user.web.dto.ScheduleDtos.ScheduleResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> findAll() {
        return workScheduleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ScheduleResponse get(UUID id) {
        WorkSchedule schedule =
                workScheduleRepository.findDetailedById(id).orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        workScheduleRepository.findByNameIgnoreCase(request.name()).ifPresent(s -> {
            throw new ConflictException("Schedule already exists: " + request.name());
        });
        WorkSchedule schedule = new WorkSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setName(request.name().trim());
        schedule.setType(request.type());
        schedule.getDays().addAll(mapDays(schedule, request.days()));
        return toResponse(workScheduleRepository.save(schedule));
    }

    private List<WorkScheduleDay> mapDays(WorkSchedule schedule, List<ScheduleDayRequest> days) {
        return days.stream()
                .map(d -> {
                    WorkScheduleDay day = new WorkScheduleDay();
                    day.setScheduleId(schedule.getId());
                    day.setSchedule(schedule);
                    day.setDayOfWeek(d.dayOfWeek());
                    day.setHours(d.hours());
                    return day;
                })
                .toList();
    }

    private ScheduleResponse toResponse(WorkSchedule schedule) {
        var dayResponses = schedule.getDays().stream()
                .map(d -> new com.taskflow.user.web.dto.ScheduleDtos.ScheduleDayResponse(d.getDayOfWeek(), d.getHours()))
                .toList();
        return new ScheduleResponse(schedule.getId(), schedule.getName(), schedule.getType(), dayResponses, schedule.getVersion());
    }
}
