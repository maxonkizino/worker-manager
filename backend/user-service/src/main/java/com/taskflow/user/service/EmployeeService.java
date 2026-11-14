package com.taskflow.user.service;

import com.taskflow.user.cache.ReferenceCache;
import com.taskflow.user.domain.AvatarPresets;
import com.taskflow.user.domain.Employee;
import com.taskflow.user.domain.EmployeeAvatar;
import com.taskflow.user.domain.EmployeeSkill;
import com.taskflow.user.domain.enums.PreferredChannel;
import com.taskflow.user.exception.ConflictException;
import com.taskflow.user.exception.ResourceNotFoundException;
import com.taskflow.user.repository.EmployeeAvatarRepository;
import com.taskflow.user.repository.EmployeeRepository;
import com.taskflow.user.repository.EmployeeSkillRepository;
import com.taskflow.user.repository.SkillRepository;
import com.taskflow.user.repository.WorkScheduleRepository;
import com.taskflow.user.security.SecurityUtils;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeRequest;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeResponse;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeSkillItem;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeSkillsRequest;
import com.taskflow.user.web.dto.EmployeeDtos.EmployeeUpdateRequest;
import com.taskflow.user.web.dto.EmployeeDtos.ProfileUpdateRequest;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeAvatarRepository employeeAvatarRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final SkillRepository skillRepository;
    private final ReferenceCache referenceCache;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> findAll() {
        Set<UUID> customAvatars = new HashSet<>(employeeAvatarRepository.findAllEmployeeIds());
        return employeeRepository.findAll().stream()
                .map(employee -> toResponse(employee, customAvatars.contains(employee.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(UUID id) {
        return toResponse(load(id));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getOwn() {
        return toResponse(loadOwn());
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsById(request.id())) {
            throw new ConflictException("Employee already exists: " + request.id());
        }
        ensureSchedule(request.scheduleId());
        Employee employee = new Employee();
        employee.setId(request.id());
        applyCreate(employee, request);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse update(UUID id, EmployeeUpdateRequest request) {
        Employee employee = load(id);
        UUID previousSchedule = employee.getScheduleId();
        java.math.BigDecimal previousFactor = employee.getUsefulTimeFactor();
        ensureSchedule(request.scheduleId());
        applyUpdate(employee, request);
        Employee saved = employeeRepository.save(employee);
        if (!previousSchedule.equals(saved.getScheduleId())
                || previousFactor.compareTo(saved.getUsefulTimeFactor()) != 0) {
            referenceCache.evictCapacity(saved.getId());
        }
        return toResponse(saved);
    }

    @Transactional
    public EmployeeResponse updateOwnProfile(ProfileUpdateRequest request) {
        Employee employee = loadOwn();
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setPosition(blankToNull(request.position()));
        employee.setTelegramChatId(request.telegramChatId());
        employee.setPreferredChannel(request.preferredChannel());
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse choosePreset(String preset) {
        Employee employee = loadOwn();
        if (preset == null || preset.isBlank()) {
            employee.setAvatarPreset(null);
        } else if (!AvatarPresets.isKnown(preset)) {
            throw new IllegalArgumentException("Неизвестный аватар из набора");
        } else {
            employee.setAvatarPreset(preset);
        }
        employee.setUseCustomAvatar(false);
        employee.setAvatarRevision(employee.getAvatarRevision() + 1);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse storeCustomAvatar(
            MultipartFile file, MultipartFile original, Double zoom, Double offsetX, Double offsetY) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл аватара пуст");
        }
        if (file.getSize() > 1_048_576) {
            throw new IllegalArgumentException("Аватар больше 1 МБ");
        }
        if (zoom != null && (zoom < 1 || zoom > 3)) {
            throw new IllegalArgumentException("Размер фото вне допустимого диапазона");
        }
        Employee employee = loadOwn();
        EmployeeAvatar avatar = employeeAvatarRepository.findById(employee.getId()).orElseGet(EmployeeAvatar::new);
        avatar.setEmployeeId(employee.getId());
        avatar.setContentType(normalizeImageType(file.getContentType()));
        try {
            avatar.setData(file.getBytes());
            if (original != null && !original.isEmpty()) {
                if (original.getSize() > 15 * 1024 * 1024) {
                    throw new IllegalArgumentException("Исходное фото больше 15 МБ");
                }
                avatar.setOriginalContentType(normalizeImageType(original.getContentType()));
                avatar.setOriginalData(original.getBytes());
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Не удалось прочитать файл");
        }
        avatar.setCropZoom(zoom);
        avatar.setCropOffsetX(offsetX);
        avatar.setCropOffsetY(offsetY);
        avatar.setUpdatedAt(Instant.now());
        employeeAvatarRepository.save(avatar);
        employee.setAvatarPreset(null);
        employee.setUseCustomAvatar(true);
        employee.setAvatarRevision(employee.getAvatarRevision() + 1);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse clearAvatar() {
        Employee employee = loadOwn();
        employeeAvatarRepository.deleteById(employee.getId());
        employee.setAvatarPreset(null);
        employee.setUseCustomAvatar(false);
        employee.setAvatarRevision(employee.getAvatarRevision() + 1);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public EmployeeAvatar requireCustomAvatar(UUID id) {
        return employeeAvatarRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Аватар не задан"));
    }

    @Transactional(readOnly = true)
    public EmployeeAvatar requireOwnAvatarSource() {
        Employee employee = loadOwn();
        EmployeeAvatar avatar = requireCustomAvatar(employee.getId());
        if (avatar.getOriginalData() == null || avatar.getOriginalData().length == 0) {
            throw new ResourceNotFoundException("Исходное фото не сохранено");
        }
        return avatar;
    }

    @Transactional
    public void replaceSkills(UUID employeeId, EmployeeSkillsRequest request) {
        load(employeeId);
        for (EmployeeSkillItem item : request.skills()) {
            if (!skillRepository.existsById(item.skillId())) {
                throw new ResourceNotFoundException("Skill not found: " + item.skillId());
            }
        }
        employeeSkillRepository.deleteByEmployeeId(employeeId);
        List<EmployeeSkill> rows = request.skills().stream()
                .map(item -> {
                    EmployeeSkill es = new EmployeeSkill();
                    es.setEmployeeId(employeeId);
                    es.setSkillId(item.skillId());
                    es.setLevel(item.level());
                    es.setUpdatedAt(Instant.now());
                    return es;
                })
                .toList();
        employeeSkillRepository.saveAll(rows);
        referenceCache.evict(ReferenceCache.skillsKey(employeeId));
    }

    private void applyCreate(Employee employee, EmployeeRequest request) {
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim());
        employee.setPosition(request.position());
        employee.setDepartmentId(request.departmentId());
        employee.setScheduleId(request.scheduleId());
        if (request.usefulTimeFactor() != null) {
            employee.setUsefulTimeFactor(request.usefulTimeFactor());
        }
        if (request.active() != null) {
            employee.setActive(request.active());
        }
        employee.setTelegramChatId(request.telegramChatId());
        if (request.preferredChannel() != null) {
            employee.setPreferredChannel(request.preferredChannel());
        } else {
            employee.setPreferredChannel(PreferredChannel.IN_APP);
        }
    }

    private void applyUpdate(Employee employee, EmployeeUpdateRequest request) {
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim());
        employee.setPosition(request.position());
        employee.setDepartmentId(request.departmentId());
        employee.setScheduleId(request.scheduleId());
        if (request.usefulTimeFactor() != null) {
            employee.setUsefulTimeFactor(request.usefulTimeFactor());
        }
        if (request.active() != null) {
            employee.setActive(request.active());
        }
        employee.setTelegramChatId(request.telegramChatId());
        if (request.preferredChannel() != null) {
            employee.setPreferredChannel(request.preferredChannel());
        }
    }

    private void ensureSchedule(UUID scheduleId) {
        if (!workScheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("Schedule not found: " + scheduleId);
        }
    }

    private Employee load(UUID id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private Employee loadOwn() {
        UUID id = SecurityUtils.currentUserId();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Требуется авторизация");
        }
        return load(id);
    }

    private EmployeeResponse toResponse(Employee employee) {
        return toResponse(employee, employeeAvatarRepository.findById(employee.getId()).orElse(null));
    }

    private EmployeeResponse toResponse(Employee employee, boolean hasAvatarPhoto) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFullName(),
                employee.getEmail(),
                employee.getPosition(),
                employee.getDepartmentId(),
                employee.getScheduleId(),
                employee.getUsefulTimeFactor() != null ? employee.getUsefulTimeFactor() : new BigDecimal("0.80"),
                employee.isActive(),
                employee.getTelegramChatId(),
                employee.getPreferredChannel(),
                employee.getAvatarPreset(),
                hasAvatarPhoto && employee.isUseCustomAvatar(),
                employee.getAvatarRevision(),
                employee.getVersion(),
                null,
                null,
                null,
                false,
                hasAvatarPhoto);
    }

    private EmployeeResponse toResponse(Employee e, EmployeeAvatar avatar) {
        boolean hasAvatarPhoto = avatar != null;
        boolean customAvatar = hasAvatarPhoto && e.isUseCustomAvatar();
        boolean avatarSource = hasAvatarPhoto && avatar.getOriginalData() != null && avatar.getOriginalData().length > 0;
        return new EmployeeResponse(
                e.getId(),
                e.getFullName(),
                e.getEmail(),
                e.getPosition(),
                e.getDepartmentId(),
                e.getScheduleId(),
                e.getUsefulTimeFactor() != null ? e.getUsefulTimeFactor() : new BigDecimal("0.80"),
                e.isActive(),
                e.getTelegramChatId(),
                e.getPreferredChannel(),
                e.getAvatarPreset(),
                customAvatar,
                e.getAvatarRevision(),
                e.getVersion(),
                hasAvatarPhoto ? avatar.getCropZoom() : null,
                hasAvatarPhoto ? avatar.getCropOffsetX() : null,
                hasAvatarPhoto ? avatar.getCropOffsetY() : null,
                avatarSource,
                hasAvatarPhoto);
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static String normalizeImageType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Нужен файл PNG, JPEG или WebP");
        }
        String type = contentType.toLowerCase();
        if (type.equals("image/jpg")) {
            type = "image/jpeg";
        }
        if (!type.equals("image/png") && !type.equals("image/jpeg") && !type.equals("image/webp")) {
            throw new IllegalArgumentException("Нужен файл PNG, JPEG или WebP");
        }
        return type;
    }
}
