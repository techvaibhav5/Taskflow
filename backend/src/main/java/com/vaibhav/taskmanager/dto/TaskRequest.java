package com.vaibhav.taskmanager.dto;

import com.vaibhav.taskmanager.model.TaskPriority;
import com.vaibhav.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDate dueDate;

    // username of the person this task should be assigned to (optional)
    private String assigneeUsername;
}
