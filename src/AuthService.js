const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

export async function login(username, password) {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  const data = await res.json();
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

export async function register(username, password, name) {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed");
  }
  const data = await res.json();
  localStorage.setItem("auth", JSON.stringify(data));
  return data;
}

export function logout() {
  localStorage.removeItem("auth");
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth") || "null");
  } catch (e) {
    return null;
  }
}

export function getToken() {
  const a = getAuth();
  return a ? a.token : null;
}

export function getRole() {
  const a = getAuth();
  return a ? a.role : null;
}

export function getUsername() {
  const a = getAuth();
  return a ? a.username : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export async function authFetch(url, opts = {}) {
  const token = getToken();
  const headers = Object.assign({}, opts.headers || {}, token ? { Authorization: `Bearer ${token}` } : {});
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  if (res.status === 401) {
    // clear auth on 401
    logout();
  }
  return res;
}

export default {
  login,
  logout,
  getAuth,
  getToken,
  getRole,
  getUsername,
  isAuthenticated,
  authFetch,
};
