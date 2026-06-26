package com.vaibhav.taskflow.controller;

import com.vaibhav.taskflow.dto.TaskRequest;
import com.vaibhav.taskflow.dto.TaskResponse;
import com.vaibhav.taskflow.entity.User;
import com.vaibhav.taskflow.repository.UserRepository;
import com.vaibhav.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(Authentication auth) {
        return ResponseEntity.ok(taskService.getTasksForUser(currentUser(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(taskService.getTaskById(id, currentUser(auth)));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request, Authentication auth) {
        TaskResponse created = taskService.createTask(request, currentUser(auth));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request, Authentication auth) {
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication auth) {
        taskService.deleteTask(id, currentUser(auth));
        return ResponseEntity.noContent().build();
    }
}
