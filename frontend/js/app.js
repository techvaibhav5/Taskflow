const token = localStorage.getItem("tf_token");
if (!token) window.location.href = "index.html";

document.getElementById("userLabel").textContent =
  `${localStorage.getItem("tf_username")} (${localStorage.getItem("tf_role")})`;

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

let allTasks = [];
let activeFilter = "ALL";

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    window.location.href = "index.html";
    return null;
  }

  if (res.status === 204) return null;
  return res.json();
}

async function loadTasks() {
  const taskList = document.getElementById("taskList");
  try {
    allTasks = await api("/tasks");
    renderTasks();
  } catch (err) {
    taskList.innerHTML = `<p class="empty-state">Could not load tasks. Is the backend running?</p>`;
  }
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  const filtered = activeFilter === "ALL"
    ? allTasks
    : allTasks.filter(t => t.status === activeFilter);

  if (!filtered.length) {
    taskList.innerHTML = `<p class="empty-state">No tasks here yet. Create one to get started.</p>`;
    return;
  }

  taskList.innerHTML = filtered.map(t => `
    <div class="task-card" data-id="${t.id}">
      <div class="task-main">
        <div class="task-title">${escapeHtml(t.title)}</div>
        ${t.description ? `<div class="task-desc">${escapeHtml(t.description)}</div>` : ""}
        <div class="task-meta">
          <span class="badge status-${t.status}">${t.status.replace("_", " ")}</span>
          <span class="badge priority-${t.priority}">${t.priority}</span>
          ${t.dueDate ? `<span>Due ${t.dueDate}</span>` : ""}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" onclick="openEdit(${t.id})">Edit</button>
        <button class="icon-btn danger" onclick="deleteTask(${t.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.querySelectorAll(".filter-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.status;
    renderTasks();
  });
});

// ---------- Modal handling ----------
const modal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

document.getElementById("newTaskBtn").addEventListener("click", () => openModal());
document.getElementById("cancelModalBtn").addEventListener("click", () => modal.classList.add("hidden"));

function openModal() {
  document.getElementById("modalTitle").textContent = "New task";
  taskForm.reset();
  document.getElementById("taskId").value = "";
  modal.classList.remove("hidden");
}

window.openEdit = function (id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("modalTitle").textContent = "Edit task";
  document.getElementById("taskId").value = task.id;
  document.getElementById("taskTitleInput").value = task.title;
  document.getElementById("taskDescInput").value = task.description || "";
  document.getElementById("taskStatusInput").value = task.status;
  document.getElementById("taskPriorityInput").value = task.priority;
  document.getElementById("taskDueDateInput").value = task.dueDate || "";
  modal.classList.remove("hidden");
};

window.deleteTask = async function (id) {
  if (!confirm("Delete this task?")) return;
  await api(`/tasks/${id}`, { method: "DELETE" });
  await loadTasks();
};

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("taskId").value;
  const payload = {
    title: document.getElementById("taskTitleInput").value.trim(),
    description: document.getElementById("taskDescInput").value.trim(),
    status: document.getElementById("taskStatusInput").value,
    priority: document.getElementById("taskPriorityInput").value,
    dueDate: document.getElementById("taskDueDateInput").value || null
  };

  if (id) {
    await api(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  } else {
    await api("/tasks", { method: "POST", body: JSON.stringify(payload) });
  }

  modal.classList.add("hidden");
  await loadTasks();
});

loadTasks();
