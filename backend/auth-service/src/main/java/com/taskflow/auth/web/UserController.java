package com.taskflow.auth.web;

import com.taskflow.auth.dto.UpdateRolesRequest;
import com.taskflow.auth.dto.UserResponse;
import com.taskflow.auth.service.UserAdminService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserAdminService userAdminService;

    @GetMapping
    public List<UserResponse> listUsers() {
        return userAdminService.listUsers();
    }

    @PatchMapping("/{id}/roles")
    public UserResponse updateRoles(@PathVariable UUID id, @Valid @RequestBody UpdateRolesRequest request) {
        return userAdminService.updateRoles(id, request);
    }

    @PatchMapping("/{id}/block")
    public UserResponse block(@PathVariable UUID id) {
        return userAdminService.block(id);
    }

    @PatchMapping("/{id}/unblock")
    public UserResponse unblock(@PathVariable UUID id) {
        return userAdminService.unblock(id);
    }
}
