# TaskFlow — Task & Workflow Management System

A full-stack task tracking app. Users register/log in (JWT-secured), create tasks, assign them, set status/priority/due dates. Admins can see all tasks; regular users only see tasks they created or are assigned to.

**Stack:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL — HTML/CSS/vanilla JS frontend.

---

## 1. Run it locally

### Backend

1. Make sure MySQL is running, then open a MySQL shell / Workbench and run:
   ```sql
   CREATE DATABASE taskflow_db;
   ```
2. Open `backend/src/main/resources/application.properties` and confirm `DB_USERNAME` / `DB_PASSWORD` match your local MySQL (defaults to `root` / `root123`).
3. From the `backend` folder:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
4. Backend runs on `http://localhost:8080`. Tables are auto-created on first run (`ddl-auto=update`).

### Frontend

1. Open `frontend/js/config.js` — leave `API_BASE_URL` as `http://localhost:8080/api` for local testing.
2. Easiest way to serve it: install the VS Code "Live Server" extension, right-click `index.html` → "Open with Live Server". (Opening the HTML file directly with `file://` will break CORS — it needs to be served over `http://`.)
3. Register an account, log in, start creating tasks.

---

## 2. Push to GitHub

```bash
cd taskflow
git init
git add .
git commit -m "Initial commit: TaskFlow full-stack app"
git branch -M main
git remote add origin https://github.com/<your-username>/taskflow.git
git push -u origin main
```

(Create the empty repo on GitHub first via "New repository" — don't initialize it with a README there, or you'll get a merge conflict.)

---

## 3. Deploy live (all free tier)

### Step A — Database on Railway
1. Go to railway.app → sign in with GitHub → "New Project" → "Provision MySQL".
2. Click the MySQL service → "Variables" tab → copy `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.

### Step B — Backend on Render
1. Go to render.com → sign in with GitHub → "New" → "Web Service" → pick your `taskflow` repo.
2. Settings:
   - Root Directory: `backend`
   - Runtime: Docker is not needed — pick **"Java"**, or use build command `./mvnw clean package -DskipTests` and start command `java -jar target/taskflow-1.0.0.jar`. If Render doesn't auto-detect Maven, add a `render.yaml` (see below) or just set those two commands manually in the dashboard.
3. Add Environment Variables (from Railway's MySQL):
   ```
   DB_URL=jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>
   DB_USERNAME=<MYSQLUSER>
   DB_PASSWORD=<MYSQLPASSWORD>
   JWT_SECRET=<any-long-random-string>
   CORS_ORIGINS=https://<your-frontend-domain>.netlify.app
   ```
4. Deploy. Render gives you a URL like `https://taskflow-backend.onrender.com`.

> Free Render web services sleep after inactivity — the first request after idle takes ~30s to wake up. That's normal, mention it if a recruiter tests it and it's slow to load.

### Step C — Frontend on Netlify
1. Edit `frontend/js/config.js`:
   ```js
   const API_BASE_URL = "https://taskflow-backend.onrender.com/api";
   ```
2. Commit and push that change.
3. Go to netlify.com → "Add new site" → "Import from GitHub" → pick the repo → set **Base directory** to `frontend`, leave build command empty, publish directory as `frontend` (or `.` relative to base).
4. Deploy. Netlify gives you a live URL like `https://taskflow-vaibhav.netlify.app`.
5. Go back to Render → update `CORS_ORIGINS` env variable to this exact Netlify URL → redeploy.

---

## 4. What to put on your resume

- **GitHub:** `https://github.com/<your-username>/taskflow`
- **Live demo:** your Netlify URL

You should be able to explain: why JWT instead of sessions (stateless, scales horizontally), how the password is hashed (BCrypt, one-way, never reversible), how role-based access works (`ADMIN` sees all tasks, `USER` only sees their own — enforced server-side in `TaskService`, not just hidden in the UI), and why CORS is configured the way it is.
