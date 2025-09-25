// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export type User = {
  id_usuario: number;
  tipo_usuario: "cliente" | "admin" | "root" | string;
  username: string;
  correo: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: (redirect?: boolean) => void;
  tokenValid: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* --- Helpers JWT --- */
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    // decodeURIComponent + escape for unicode-safe decode
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch {
    return null;
  }
}
function isTokenExpired(token: string | null) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const expMs = payload.exp * 1000;
  return Date.now() >= expMs;
}

/* --- Keys localStorage --- */
const LS_TOKEN_KEY = "swk_token";
const LS_USER_KEY = "swk_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const logoutTimerRef = useRef<number | null>(null);

  // lazy state init: evita que PrivateRoute vea null antes de leer localStorage
  const [token, setToken] = useState<string | null>(() => {
    try {
      const t = localStorage.getItem(LS_TOKEN_KEY);
      if (t && !isTokenExpired(t)) return t;
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
      return null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const u = localStorage.getItem(LS_USER_KEY);
      if (!u) return null;
      return JSON.parse(u) as User;
    } catch {
      return null;
    }
  });

  // Programa auto-logout según exp del token
  useEffect(() => {
    // limpia timer anterior
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (token) {
      const payload = parseJwt(token);
      if (payload?.exp) {
        const expMs = payload.exp * 1000;
        const msUntil = expMs - Date.now();
        if (msUntil <= 0) {
          // ya expirado -> logout inmediato
          doLogout(false);
        } else {
          // programar logout
          logoutTimerRef.current = window.setTimeout(() => {
            // desencadena logout
            doLogout(true);
          }, msUntil);
        }
      }
    }

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Listener global para el evento disparado por axios (swk_logout)
  useEffect(() => {
    const handler = () => {
      doLogout(false);
    };
    window.addEventListener("swk_logout", handler);
    return () => window.removeEventListener("swk_logout", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función interna de logout para evitar duplicar lógica
  const doLogout = (redirect = true) => {
    try {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_USER_KEY);
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (redirect) {
      navigate("/login", { replace: true });
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    // Ajusta el payload según tu backend (correo o email)
    const credentials = { correo: emailOrUsername, password_bash: password };
    try {
      const res = await api.post("/auth/login", credentials);
      const { token: newToken, username, id_usuario, email, tipo_usuario } = res.data;
      const userObj: User = { id_usuario, username, correo: email, tipo_usuario };

      localStorage.setItem(LS_TOKEN_KEY, newToken);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(userObj));
      setToken(newToken);
      setUser(userObj);
      // no redirect aquí; deja quien llame manejar redirección
    } catch (err) {
      throw err;
    }
  };

  // Exponer logout que también permite redirect opcional
  const logout = (redirect = true) => doLogout(redirect);

  const tokenValid = () => !!token && !isTokenExpired(token);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && !isTokenExpired(token)),
      login,
      logout,
      tokenValid,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
