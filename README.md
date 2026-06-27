# Taskkflow — Task & Workflow Management System

A full-stack task tracking and team collaboration tool. Built with a Spring Boot REST API
backend, MySQL for persistence, JWT-based authentication, and a vanilla HTML/CSS/JS frontend
served by the same application.

## Features

- **JWT authentication** — register and log in, token stored client-side and sent as a Bearer
  token on every API request.
- **Role-based access control** — the first account created on a fresh database becomes `ADMIN`
  automatically; everyone after that is a regular `USER`. Admins can see and manage every task in
  the system; regular users only see tasks they created or were assigned.
- **Task CRUD** — create, edit, delete, and reassign tasks. Only a task's creator (or an admin)
  can edit or delete it; anyone who can see a task can drag it across the board.
- **Kanban board** — drag-and-drop cards between To Do / In Progress / Done columns using the
  native HTML5 drag-and-drop API (no external libraries).
- **Filtering** — toggle between "All", "Created by me", and "Assigned to me".

## Tech stack

| Layer        | Technology                                              |
|--------------|----------------------------------------------------------|
| Backend      | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Auth         | JWT (jjwt), BCrypt password hashing                     |
| Database     | MySQL                                                    |
| Frontend     | HTML5, CSS3 (custom design system, no framework), vanilla JS |
| Deployment   | Docker, Render (API), Aiven (managed MySQL)              |

## Architecture notes

- The frontend lives in `src/main/resources/static/` and is served directly by Spring Boot, so
  there's a single deployable artifact and no CORS configuration is strictly required (CORS is
  still enabled in `SecurityConfig` in case you ever split the frontend out).
- `Task.assignee` and `Task.createdBy` are lazy `@ManyToOne` associations. `spring.jpa.open-in-view`
  is disabled (it's a well-known anti-pattern in production Spring apps), so `TaskService` methods
  are explicitly wrapped in `@Transactional` to keep the Hibernate session open long enough to map
  entities to DTOs safely.
- Passwords are hashed with BCrypt and never serialized in API responses (`@JsonIgnore` on
  `User.password`).
- All write endpoints check ownership/role in the service layer (`TaskService.assertCanModify`,
  `assertCanView`) rather than trusting the client.

## Running locally

### Prerequisites
- JDK 17+
- Maven 3.8+
- A local MySQL instance (or Docker)

### 1. Create a local database
```sql
CREATE DATABASE taskmanager_db;
```

### 2. Run the backend
```bash
cd backend
mvn spring-boot:run
```

By default it connects to `jdbc:mysql://localhost:3306/taskmanager_db` with username/password
`root`/`root`. Override with environment variables if yours differ:

```bash
export DB_URL=jdbc:mysql://localhost:3306/taskmanager_db
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
mvn spring-boot:run
```

### 3. Open the app
Visit `http://localhost:8080`. Register an account — the first one you create becomes the admin.

## Environment variables (production)

| Variable          | Purpose                                              |
|-------------------|-------------------------------------------------------|
| `DB_URL`          | JDBC URL for the MySQL instance                       |
| `DB_USERNAME`     | Database username                                     |
| `DB_PASSWORD`     | Database password                                     |
| `JWT_SECRET`      | Base64-encoded signing key for JWTs (256-bit minimum) |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds (default 24h)        |
| `PORT`            | Port the server listens on (Render sets this automatically) |

Generate a strong JWT secret with:
```bash
openssl rand -base64 32
```

## API overview

| Method | Endpoint                  | Auth required | Description                          |
|--------|----------------------------|----------------|---------------------------------------|
| POST   | `/api/auth/register`       | No             | Create an account                     |
| POST   | `/api/auth/login`          | No             | Log in, get a JWT                     |
| GET    | `/api/users/me`            | Yes            | Current user's profile                |
| GET    | `/api/users`               | Yes            | List teammates (for assignment)       |
| GET    | `/api/tasks`                | Yes           | List tasks visible to the current user (optional `?status=` filter) |
| POST   | `/api/tasks`                | Yes           | Create a task                         |
| GET    | `/api/tasks/{id}`           | Yes           | Get a single task                     |
| PUT    | `/api/tasks/{id}`           | Yes           | Update a task (creator/admin only)    |
| PATCH  | `/api/tasks/{id}/status`    | Yes           | Move a task to a new status           |
| DELETE | `/api/tasks/{id}`           | Yes           | Delete a task (creator/admin only)    |

## Deployment

See the deployment guide shared alongside this project for step-by-step instructions to deploy
this to Render (backend) with Aiven (managed free MySQL).
