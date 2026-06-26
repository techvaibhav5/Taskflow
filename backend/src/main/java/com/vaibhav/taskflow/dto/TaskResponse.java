package com.vaibhav.taskflow.dto;

import com.vaibhav.taskflow.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private LocalDate dueDate;
    private String assignedToUsername;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : null,
                task.getCreatedBy().getUsername(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
