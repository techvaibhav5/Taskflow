# TaskFlow — Task & Workflow Management System

🔗 **Live Demo:** [task-flow-management.netlify.app](https://task-flow-management.netlify.app/) — register an account and try it yourself.

A decoupled full-stack task tracking application featuring secure session handling and role-isolated access controls.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript

## Core Features

- **Authentication:** Secure registration and login using JWT and BCrypt password hashing — no plain-text passwords ever stored.
- **Role-Based Access Control:** Server-side controls separate Admin-level task visibility (sees everything) from regular User access (only tasks they created or are assigned to).
- **Task Management:** Full CRUD on tasks — title, description, status (To Do / In Progress / Done), priority (Low / Medium / High), and due dates.
- **REST API:** Clean, stateless REST endpoints for auth and task operations, with configured CORS boundaries for cross-origin frontend-backend communication.
- **Persistence:** Relational schema managed through Spring Data JPA with MySQL, auto-migrated on startup.

## How to Run Locally

**Backend**
1. Create a MySQL database:
```sql
   CREATE DATABASE taskflow_db;
```
2. Open the `backend` folder in IntelliJ IDEA — Maven dependencies resolve automatically.
3. Confirm `backend/src/main/resources/application.properties` matches your local MySQL credentials (defaults to `root` / `root123`).
4. Run `TaskflowApplication.java` — server starts on `http://localhost:8080`.

**Frontend**
1. Open `frontend/index.html` directly in a browser.
2. Register an account, log in, and start creating tasks from the dashboard.

## Project Structure
taskflow/

├── backend/    → Spring Boot REST API (Java)

└── frontend/   → HTML/CSS/JS client

