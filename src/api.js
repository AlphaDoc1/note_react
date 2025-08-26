import axios from "axios";

// Prefer environment variable set in Vercel. Fallback to local dev proxy.
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const http = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Backwards compatible name used in components
export const axiosApi = http;

// Convenience auth helpers
export const authApi = {
  register(payload) {
    return http.post("/api/auth/register", payload);
  },
  login(payload) {
    return http.post("/api/auth/login", payload);
  },
};

// Compatibility helpers for components using fetch-based API
export const apiUrl = (path) => `${API_BASE}${path}`;
export const apiFetch = (path, options = {}) => {
  const url = apiUrl(path);
  return fetch(url, options);
};




