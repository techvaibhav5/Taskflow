/**
 * Tiny fetch wrapper shared by the auth and dashboard pages.
 * Since the frontend is served by the same Spring Boot app as the API,
 * we just call relative paths - no base URL configuration needed.
 */
const Api = (() => {
  const TOKEN_KEY = "wf_token";
  const USER_KEY = "wf_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function request(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = data?.error || data?.fieldErrors
        ? (data.error || Object.values(data.fieldErrors)[0])
        : `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data;
  }

  return {
    getToken,
    getUser,
    setSession,
    clearSession,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    del: (path) => request(path, { method: "DELETE" }),
  };
})();
