// src/routes/AdminRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

type AdminRouteProps = { children: ReactNode };

export default function AdminRoute({ children }: AdminRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    if (auth.token && !auth.tokenValid()) {
      auth.logout();
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = auth.user?.tipo_usuario;
  if (role !== "admin" && role !== "root") {
    // Forbidden: you can redirect to home or 403 page
    return <Navigate to="/" replace />;
  }

  return children;
}
