(() => {
  const user = Api.getUser();
  if (!Api.getToken() || !user) {
    window.location.href = "index.html";
    return;
  }

  const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
  let allTasks = [];
  let teammates = [];
  let activeFilter = "all";
  let editingTaskId = null;

  // ---------- header ----------
  document.getElementById("username-label").textContent = user.username;
  document.getElementById("user-avatar").textContent = user.username.slice(0, 2).toUpperCase();
  document.getElementById("role-chip").textContent = user.role;
  document.getElementById("board-subtitle").textContent =
    user.role === "ADMIN" ? "Admin view — every task in the system" : "Tasks you created or were assigned";

  document.getElementById("logout-btn").addEventListener("click", () => {
    Api.clearSession();
    window.location.href = "index.html";
  });

  // ---------- toast ----------
  let toastTimer;
  function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.toggle("error", isError);
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  // ---------- data loading ----------
  async function loadTeammates() {
    try {
      teammates = await Api.get("/api/users");
      const select = document.getElementById("task-assignee");
      select.innerHTML = '<option value="">Unassigned</option>';
      teammates.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.username;
        opt.textContent = t.username;
        select.appendChild(opt);
      });
    } catch (err) {
      // Non-fatal - assignment just won't be available
      console.warn("Could not load teammates:", err.message);
    }
  }

  async function loadTasks() {
    try {
      allTasks = await Api.get("/api/tasks");
      renderBoard();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  // ---------- filtering + rendering ----------
  document.querySelectorAll(".chip-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip-toggle").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderBoard();
    });
  });

  function getFilteredTasks() {
    if (activeFilter === "mine") {
      return allTasks.filter((t) => t.createdByUsername === user.username);
    }
    if (activeFilter === "assigned") {
      return allTasks.filter((t) => t.assigneeUsername === user.username);
    }
    return allTasks;
  }

  function formatDueDate(dueDate) {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate + "T00:00:00");
    const isOverdue = date < new Date(new Date().toDateString());
    const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { label, isOverdue };
  }

  function renderBoard() {
    const filtered = getFilteredTasks();

    STATUSES.forEach((status) => {
      const tasksForColumn = filtered.filter((t) => t.status === status);
      document.getElementById(`count-${status}`).textContent = tasksForColumn.length;

      const drop = document.getElementById(`drop-${status}`);
      drop.innerHTML = "";

      if (tasksForColumn.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-column";
        empty.textContent = "Nothing here yet";
        drop.appendChild(empty);
        return;
      }

      tasksForColumn.forEach((task) => drop.appendChild(buildTaskCard(task)));
    });
  }

  function buildTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.dataset.taskId = task.id;

    const canModify = user.role === "ADMIN" || task.createdByUsername === user.username;

    let dueHtml = "No due date";
    const due = formatDueDate(task.dueDate);
    if (typeof due === "object") {
      dueHtml = `<span class="due-date ${due.isOverdue ? "overdue" : ""}">Due ${due.label}</span>`;
    }

    card.innerHTML = `
      <div class="task-card-top">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <span class="priority-tag ${task.priority}">${task.priority}</span>
      </div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ""}
      <div class="task-meta">
        <span>${dueHtml}</span>
        <span>${task.assigneeUsername ? "@" + escapeHtml(task.assigneeUsername) : "unassigned"}</span>
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit">Edit</button>
        ${canModify ? '<button class="icon-btn danger" data-action="delete">Delete</button>' : ""}
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener("click", () => openModal(task));
    const deleteBtn = card.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteTask(task.id));
    }

    card.addEventListener("dragstart", () => {
      card.classList.add("dragging");
      card.dataset.dragging = "true";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });

    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- drag and drop between columns ----------
  STATUSES.forEach((status) => {
    const drop = document.getElementById(`drop-${status}`);

    drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      drop.classList.add("drag-over");
    });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag-over"));

    drop.addEventListener("drop", async (e) => {
      e.preventDefault();
      drop.classList.remove("drag-over");
      const dragging = document.querySelector(".task-card.dragging");
      if (!dragging) return;

      const taskId = dragging.dataset.taskId;
      const task = allTasks.find((t) => String(t.id) === taskId);
      if (!task || task.status === status) return;

      try {
        await Api.patch(`/api/tasks/${taskId}/status`, { status });
        task.status = status;
        renderBoard();
        showToast(`Moved "${task.title}" to ${status.replace("_", " ").toLowerCase()}`);
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  // ---------- modal: create / edit ----------
  const backdrop = document.getElementById("task-modal-backdrop");
  const form = document.getElementById("task-form");
  const modalError = document.getElementById("modal-error");

  function openModal(task = null) {
    modalError.classList.remove("visible");
    editingTaskId = task ? task.id : null;
    document.getElementById("modal-title").textContent = task ? "Edit task" : "New task";
    document.getElementById("task-title").value = task?.title || "";
    document.getElementById("task-description").value = task?.description || "";
    document.getElementById("task-priority").value = task?.priority || "MEDIUM";
    document.getElementById("task-status").value = task?.status || "TODO";
    document.getElementById("task-due-date").value = task?.dueDate || "";
    document.getElementById("task-assignee").value = task?.assigneeUsername || "";
    backdrop.classList.add("visible");
  }

  function closeModal() {
    backdrop.classList.remove("visible");
    form.reset();
    editingTaskId = null;
  }

  document.getElementById("new-task-btn").addEventListener("click", () => openModal());
  document.getElementById("modal-cancel-btn").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    modalError.classList.remove("visible");

    const payload = {
      title: document.getElementById("task-title").value.trim(),
      description: document.getElementById("task-description").value.trim(),
      priority: document.getElementById("task-priority").value,
      status: document.getElementById("task-status").value,
      dueDate: document.getElementById("task-due-date").value || null,
      assigneeUsername: document.getElementById("task-assignee").value || null,
    };

    try {
      if (editingTaskId) {
        await Api.put(`/api/tasks/${editingTaskId}`, payload);
        showToast("Task updated");
      } else {
        await Api.post("/api/tasks", payload);
        showToast("Task created");
      }
      closeModal();
      await loadTasks();
    } catch (err) {
      modalError.textContent = err.message;
      modalError.classList.add("visible");
    }
  });

  async function deleteTask(id) {
    if (!confirm("Delete this task? This can't be undone.")) return;
    try {
      await Api.del(`/api/tasks/${id}`);
      showToast("Task deleted");
      await loadTasks();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  // ---------- init ----------
  loadTeammates();
  loadTasks();
})();
