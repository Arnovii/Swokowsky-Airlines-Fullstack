// src/routes/ClientRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

type ClientRouteProps = { 
  children: ReactNode;
};

export default function ClientRoute({ children }: ClientRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!auth.isAuthenticated) {
    if (auth.token && !auth.tokenValid()) {
      auth.logout();
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si es administrador o root, bloquear acceso
  const role = auth.user?.tipo_usuario;
  if (role === "admin" || role === "root") {
    // Redirigir a su panel de administrador
    return <Navigate to="/panelAdministrador" replace />;
  }

  // Si es cliente, permitir acceso
  return children;
}