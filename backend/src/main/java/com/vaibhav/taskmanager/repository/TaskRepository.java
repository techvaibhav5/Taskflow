package com.vaibhav.taskmanager.repository;

import com.vaibhav.taskmanager.model.Task;
import com.vaibhav.taskmanager.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Tasks visible to a regular user: either they created it or it's assigned to them
    List<Task> findByCreatedByIdOrAssigneeId(Long createdById, Long assigneeId);

    List<Task> findByStatus(TaskStatus status);
}
