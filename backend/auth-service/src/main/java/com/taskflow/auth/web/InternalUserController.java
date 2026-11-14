package com.taskflow.auth.web;

import com.taskflow.auth.domain.User;
import com.taskflow.auth.repository.UserRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;

    public InternalUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public InternalUserResponse get(@PathVariable UUID id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new InternalUserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getFullName());
    }

    public record InternalUserResponse(UUID id, String username, String email, String fullName) {}
}
