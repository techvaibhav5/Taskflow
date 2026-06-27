package com.vaibhav.taskmanager.controller;

import com.vaibhav.taskmanager.dto.UserResponse;
import com.vaibhav.taskmanager.model.User;
import com.vaibhav.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return UserResponse.fromEntity(currentUser);
    }

    // Any authenticated user can list teammates - needed to populate the "assign to" dropdown
    @GetMapping
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserResponse::fromEntity).toList();
    }
}
