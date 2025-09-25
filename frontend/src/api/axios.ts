// src/api/axios.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 15000,
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("swk_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor: si recibimos 401 -> forzamos logout global
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        // Limpiar localStorage (evita loops)
        localStorage.removeItem("swk_token");
        localStorage.removeItem("swk_user");
      } catch (e) {
        // ignore
      }
      // Disparar evento global que el AuthProvider escuchará
      window.dispatchEvent(new Event("swk_logout"));
    }
    return Promise.reject(err);
  }
);

export default api;
