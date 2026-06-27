package com.vaibhav.taskmanager.service;

import com.vaibhav.taskmanager.dto.TaskRequest;
import com.vaibhav.taskmanager.dto.TaskResponse;
import com.vaibhav.taskmanager.exception.ForbiddenActionException;
import com.vaibhav.taskmanager.exception.ResourceNotFoundException;
import com.vaibhav.taskmanager.model.*;
import com.vaibhav.taskmanager.repository.TaskRepository;
import com.vaibhav.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Transaction boundaries matter here: open-in-view is disabled (see application.properties),
 * so the Hibernate session closes as soon as each repository call returns. Since Task.assignee
 * and Task.createdBy are lazy associations, and TaskResponse.fromEntity() reads them, every method
 * that touches a Task needs an open transaction wrapping both the fetch and the DTO conversion -
 * otherwise mapping to TaskResponse outside the transaction throws LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Admins see every task in the system. Regular users only see tasks
     * they created or tasks that have been assigned to them.
     */
    public List<TaskResponse> getVisibleTasks(User currentUser, TaskStatus statusFilter) {
        List<Task> tasks;

        if (currentUser.getRole() == Role.ADMIN) {
            tasks = (statusFilter != null)
                    ? taskRepository.findByStatus(statusFilter)
                    : taskRepository.findAll();
        } else {
            tasks = taskRepository.findByCreatedByIdOrAssigneeId(currentUser.getId(), currentUser.getId());
            if (statusFilter != null) {
                tasks = tasks.stream().filter(t -> t.getStatus() == statusFilter).toList();
            }
        }

        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    public TaskResponse getTaskById(Long id, User currentUser) {
        Task task = findTaskOrThrow(id);
        assertCanView(task, currentUser);
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, User currentUser) {
        User assignee = resolveAssignee(request.getAssigneeUsername());

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .assignee(assignee)
                .createdBy(currentUser)
                .build();

        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, User currentUser) {
        Task task = findTaskOrThrow(id);
        assertCanModify(task, currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDueDate(request.getDueDate());
        task.setAssignee(resolveAssignee(request.getAssigneeUsername()));

        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus newStatus, User currentUser) {
        Task task = findTaskOrThrow(id);
        // Anyone who can view the task (creator, assignee, or admin) can move it across the board.
        assertCanView(task, currentUser);
        task.setStatus(newStatus);
        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTask(Long id, User currentUser) {
        Task task = findTaskOrThrow(id);
        assertCanModify(task, currentUser);
        taskRepository.delete(task);
    }

    // --- helpers ---

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    private User resolveAssignee(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with username: " + username));
    }

    private boolean isOwnerOrAssignee(Task task, User user) {
        boolean isCreator = task.getCreatedBy() != null && task.getCreatedBy().getId().equals(user.getId());
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(user.getId());
        return isCreator || isAssignee;
    }

    private void assertCanView(Task task, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (!isOwnerOrAssignee(task, user)) {
            throw new ForbiddenActionException("You do not have permission to view this task");
        }
    }

    private void assertCanModify(Task task, User user) {
        if (user.getRole() == Role.ADMIN) return;
        boolean isCreator = task.getCreatedBy() != null && task.getCreatedBy().getId().equals(user.getId());
        if (!isCreator) {
            throw new ForbiddenActionException("Only the task creator or an admin can modify this task");
        }
    }
}
