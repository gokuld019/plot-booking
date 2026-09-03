// lib/api.js

const API_BASE_URL = "https://api.crazystory.in/api";

// ─── Helper ───────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────
export async function registerCustomer({ name, email, phone }) {
  return apiFetch("/customer/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone }),
  });
}

export async function loginCustomer({ email, password }) {
  return apiFetch("/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutCustomer() {
  return apiFetch("/customer/logout", { method: "POST" });
}

// ─── Profile ──────────────────────────────────────────────
export async function getProfile() {
  return apiFetch("/customer/profile");
}

// ─── Dashboard ────────────────────────────────────────────
export async function getDashboardStatistics() {
  return apiFetch("/customer/dashboard/statistics");
}

// ─── Projects ─────────────────────────────────────────────
export async function getAllProjects() {
  return apiFetch("/customer/projects");
}

export async function getFeaturedProjects() {
  return apiFetch("/customer/projects/featured");
}

export async function getProject(id) {
  return apiFetch(`/customer/projects/${id}`);
}

// ─── Token helpers ────────────────────────────────────────
export function saveAuth(token, user) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function getAuth() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("auth_user");
  if (!token || !user) return null;
  return { token, user: JSON.parse(user) };
}

export function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}