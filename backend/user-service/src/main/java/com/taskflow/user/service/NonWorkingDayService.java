package com.taskflow.user.service;

import com.taskflow.user.domain.NonWorkingDay;
import com.taskflow.user.domain.enums.NonWorkingDayKind;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.NonWorkingDayRepository;
import com.taskflow.user.web.dto.NonWorkingDayDtos.NonWorkingDayRequest;
import com.taskflow.user.web.dto.NonWorkingDayDtos.NonWorkingDayResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NonWorkingDayService {

    private final NonWorkingDayRepository nonWorkingDayRepository;

    @Transactional(readOnly = true)
    public List<NonWorkingDayResponse> findAll() {
        return nonWorkingDayRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public NonWorkingDayResponse create(NonWorkingDayRequest request) {
        if (nonWorkingDayRepository.existsByDate(request.date())) {
            throw new ConflictException("Non-working day already exists for " + request.date());
        }
        NonWorkingDay day = new NonWorkingDay();
        day.setId(UUID.randomUUID());
        day.setDate(request.date());
        day.setName(request.name().trim());
        day.setKind(request.kind() != null ? request.kind() : NonWorkingDayKind.HOLIDAY);
        return toResponse(nonWorkingDayRepository.save(day));
    }

    private NonWorkingDayResponse toResponse(NonWorkingDay day) {
        return new NonWorkingDayResponse(day.getId(), day.getDate(), day.getName(), day.getKind());
    }
}
