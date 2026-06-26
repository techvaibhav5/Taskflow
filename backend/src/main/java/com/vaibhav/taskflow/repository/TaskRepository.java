package com.vaibhav.taskflow.repository;

import com.vaibhav.taskflow.entity.Task;
import com.vaibhav.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo(User user);
    List<Task> findByCreatedBy(User user);
    List<Task> findByStatus(Task.Status status);
}
