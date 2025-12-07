// src/routes/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type PrivateRouteProps = {
  children: React.JSX.Element;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    // If token present but expired, logout to clean localStorage
    if (auth.token && !auth.tokenValid()) {
      auth.logout();
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
