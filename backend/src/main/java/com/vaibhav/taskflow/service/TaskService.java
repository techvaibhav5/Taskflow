package com.vaibhav.taskflow.service;

import com.vaibhav.taskflow.dto.TaskRequest;
import com.vaibhav.taskflow.dto.TaskResponse;
import com.vaibhav.taskflow.entity.Task;
import com.vaibhav.taskflow.entity.User;
import com.vaibhav.taskflow.repository.TaskRepository;
import com.vaibhav.taskflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /** ADMIN sees every task; a regular USER only sees tasks they created or are assigned to. */
    public List<TaskResponse> getTasksForUser(User currentUser) {
        List<Task> tasks;
        if (currentUser.getRole() == User.Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else {
            tasks = taskRepository.findAll().stream()
                    .filter(t -> t.getCreatedBy().getId().equals(currentUser.getId())
                            || (t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId())))
                    .toList();
        }
        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    public TaskResponse getTaskById(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        assertCanAccess(task, currentUser);
        return TaskResponse.fromEntity(task);
    }

    public TaskResponse createTask(TaskRequest request, User currentUser) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : Task.Status.TODO);
        task.setPriority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setCreatedBy(currentUser);

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee user not found"));
            task.setAssignedTo(assignee);
        }

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        assertCanAccess(task, currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());

        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee user not found"));
            task.setAssignedTo(assignee);
        }

        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
        assertCanAccess(task, currentUser);
        taskRepository.delete(task);
    }

    private void assertCanAccess(Task task, User currentUser) {
        boolean isOwnerOrAssignee = task.getCreatedBy().getId().equals(currentUser.getId())
                || (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId()));

        if (currentUser.getRole() != User.Role.ADMIN && !isOwnerOrAssignee) {
            throw new AccessDeniedException("You do not have permission to access this task");
        }
    }
}
