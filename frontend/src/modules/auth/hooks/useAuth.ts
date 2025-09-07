// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { login, getProfile } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mantener sesión si ya hay token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token); // guardar JWT
      setUser(data.user); // opcional, si el backend devuelve user
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, error, handleLogin, handleLogout };
}
