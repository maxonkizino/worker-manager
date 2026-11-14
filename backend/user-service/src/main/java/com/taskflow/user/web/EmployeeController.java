package com.taskflow.user.web;

import com.taskflow.user.domain.EmployeeAvatar;
import com.taskflow.user.service.CapacityService;
import com.taskflow.user.service.EmployeeService;
import com.taskflow.user.web.dto.EmployeeDtos.AvatarPresetRequest;
import com.taskflow.user.web.dto.EmployeeDtos.CapacityResponse;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeRequest;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeResponse;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeSkillsRequest;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeUpdateRequest;
import com.taskflow.user.web.dto.EmployeeDtos.ProfileUpdateRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CapacityService capacityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<EmployeeResponse> list() {
        return employeeService.findAll();
    }

    @GetMapping("/me")
    public EmployeeResponse me() {
        return employeeService.getOwn();
    }

    @PatchMapping("/me")
    public EmployeeResponse updateMe(@Valid @RequestBody ProfileUpdateRequest request) {
        return employeeService.updateOwnProfile(request);
    }

    @PutMapping("/me/avatar-preset")
    public EmployeeResponse choosePreset(@Valid @RequestBody AvatarPresetRequest request) {
        return employeeService.choosePreset(request.preset());
    }

    @PutMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployeeResponse uploadAvatar(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "original", required = false) MultipartFile original,
            @RequestParam(value = "zoom", required = false) Double zoom,
            @RequestParam(value = "offsetX", required = false) Double offsetX,
            @RequestParam(value = "offsetY", required = false) Double offsetY) {
        return employeeService.storeCustomAvatar(file, original, zoom, offsetX, offsetY);
    }

    @GetMapping("/me/avatar-source")
    public ResponseEntity<byte[]> ownAvatarSource() {
        EmployeeAvatar avatar = employeeService.requireOwnAvatarSource();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(avatar.getOriginalContentType()))
                .cacheControl(CacheControl.noStore())
                .body(avatar.getOriginalData());
    }

    @DeleteMapping("/me/avatar")
    public EmployeeResponse clearAvatar() {
        return employeeService.clearAvatar();
    }

    @GetMapping("/{id}")
    public EmployeeResponse get(@PathVariable UUID id) {
        return employeeService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeUpdateRequest request) {
        return employeeService.update(id, request);
    }

    @PutMapping("/{id}/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateSkills(@PathVariable UUID id, @Valid @RequestBody EmployeeSkillsRequest request) {
        employeeService.replaceSkills(id, request);
    }

    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> avatar(@PathVariable UUID id) {
        EmployeeAvatar avatar = employeeService.requireCustomAvatar(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(avatar.getContentType()))
                .cacheControl(CacheControl.noStore())
                .body(avatar.getData());
    }

    @GetMapping("/{id}/capacity")
    public CapacityResponse capacity(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return new CapacityResponse(id, from, to, capacityService.employeeCapacity(id, from, to));
    }
}
