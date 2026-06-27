package com.vaibhav.taskmanager.controller;

import com.vaibhav.taskmanager.dto.TaskRequest;
import com.vaibhav.taskmanager.dto.TaskResponse;
import com.vaibhav.taskmanager.dto.TaskStatusUpdateRequest;
import com.vaibhav.taskmanager.model.TaskStatus;
import com.vaibhav.taskmanager.model.User;
import com.vaibhav.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskResponse> getTasks(@AuthenticationPrincipal User currentUser,
                                        @RequestParam(required = false) TaskStatus status) {
        return taskService.getVisibleTasks(currentUser, status);
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return taskService.getTaskById(id, currentUser);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request, currentUser));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id,
                                    @Valid @RequestBody TaskRequest request,
                                    @AuthenticationPrincipal User currentUser) {
        return taskService.updateTask(id, request, currentUser);
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody TaskStatusUpdateRequest request,
                                      @AuthenticationPrincipal User currentUser) {
        return taskService.updateStatus(id, request.getStatus(), currentUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
