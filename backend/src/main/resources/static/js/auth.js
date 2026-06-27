(() => {
  const loginView = document.getElementById("login-view");
  const registerView = document.getElementById("register-view");
  const errorBanner = document.getElementById("error-banner");

  // If already logged in, skip straight to the dashboard.
  if (Api.getToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.classList.add("visible");
  }

  function clearError() {
    errorBanner.classList.remove("visible");
  }

  document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault();
    clearError();
    loginView.style.display = "none";
    registerView.style.display = "block";
  });

  document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    clearError();
    registerView.style.display = "none";
    loginView.style.display = "block";
  });

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await Api.post("/api/auth/login", { username, password });
      Api.setSession(res.token, { id: res.userId, username: res.username, role: res.role });
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
    }
  });

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    try {
      const res = await Api.post("/api/auth/register", { username, email, password });
      Api.setSession(res.token, { id: res.userId, username: res.username, role: res.role });
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
    }
  });
})();
