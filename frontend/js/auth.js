const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

// If already logged in, skip straight to dashboard
if (localStorage.getItem("tf_token")) {
  window.location.href = "dashboard.html";
}

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  authMessage.textContent = "";
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  authMessage.textContent = "";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      authMessage.textContent = data.error || "Login failed";
      return;
    }

    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_username", data.username);
    localStorage.setItem("tf_role", data.role);
    window.location.href = "dashboard.html";
  } catch (err) {
    authMessage.textContent = "Could not reach the server. Is the backend running?";
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";

  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      authMessage.textContent = data.error || "Registration failed";
      return;
    }

    authMessage.style.color = "#246b3a";
    authMessage.textContent = "Account created. You can sign in now.";
    tabLogin.click();
  } catch (err) {
    authMessage.textContent = "Could not reach the server. Is the backend running?";
  }
});
