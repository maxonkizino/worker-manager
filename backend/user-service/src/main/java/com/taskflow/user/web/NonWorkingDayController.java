package com.taskflow.user.web;

import com.taskflow.user.service.NonWorkingDayService;
import com.taskflow.user.web.dto.NonWorkingDayDtos.NonWorkingDayRequest;
import com.taskflow.user.web.dto.NonWorkingDayDtos.NonWorkingDayResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/non-working-days")
@RequiredArgsConstructor
public class NonWorkingDayController {

    private final NonWorkingDayService nonWorkingDayService;

    @GetMapping
    public List<NonWorkingDayResponse> list() {
        return nonWorkingDayService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public NonWorkingDayResponse create(@Valid @RequestBody NonWorkingDayRequest request) {
        return nonWorkingDayService.create(request);
    }
}
