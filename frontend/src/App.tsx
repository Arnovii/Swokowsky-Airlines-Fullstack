import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import AuthLayout from "@/layout/AuthLayout"; // <-- nuevo
import Login from "@/modules/auth/components/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas de autenticación */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        {/* Rutas protegidas con el layout principal */}
        <Route
          path="/"
          element={
            <MainLayout>
              <h1 className="text-white">Home Page</h1>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
