# TaskFlow — Task & Workflow Management System

🔗 **Live Demo:** [taskflow-management-9oxp.onrender.com](https://taskflow-management-9oxp.onrender.com) — register an account and try it (the first account created becomes admin).

A full-stack task tracking application with a drag-and-drop Kanban board, JWT authentication, and role-based access control.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript (native drag-and-drop, no libraries)

## Core Features

- **Authentication:** Secure registration and login using JWT and BCrypt password hashing — no plain-text passwords ever stored.
- **Role-Based Access Control:** The first account created automatically becomes Admin and can see every task in the system. Every account after that is a standard User, who only sees tasks they created or were assigned.
- **Kanban Board:** Tasks move across To Do / In Progress / Done columns via native HTML5 drag-and-drop — no external library.
- **Task Management:** Full CRUD on tasks — title, description, priority (Low / Medium / High), due dates, and teammate assignment.
- **REST API:** Stateless REST endpoints secured with JWT, validated server-side on every request via a custom authentication filter.
- **Single Deployable Unit:** Frontend is served directly by the Spring Boot backend — no separate hosting, no CORS configuration needed.

## How to Run Locally

1. Create a MySQL database:
```sql
   CREATE DATABASE taskmanager_db;
```
2. Open the `backend` folder in IntelliJ IDEA — Maven dependencies resolve automatically.
3. Confirm `backend/src/main/resources/application.properties` matches your local MySQL credentials.
4. Run `TaskManagerApplication.java` — the app starts on `http://localhost:8080`.
5. Open `http://localhost:8080` in a browser, register an account, and start creating tasks.

## Project Structure

```
taskflow/
└── backend/
    ├── src/main/java/...        → Spring Boot REST API (Java)
    └── src/main/resources/
        └── static/              → HTML/CSS/JS frontend, served by the same backend
```