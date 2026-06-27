package com.vaibhav.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Task & Workflow Management System.
 *
 * This is a full-stack application: Spring Boot REST API backend
 * with a vanilla HTML/CSS/JS frontend served as static resources.
 */
@SpringBootApplication
public class TaskManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
