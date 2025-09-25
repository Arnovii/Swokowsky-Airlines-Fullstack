// src/modules/auth/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* efecto difuso detrás */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-400 rounded-2xl blur-2xl opacity-50 -z-10"></div>

        {/* encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-gray-500">Inicia sesión para continuar</p>
        </div>

        {/* formulario funcional */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@dominio.com"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Iniciar sesión
          </button>
        </form>

        {/* sección registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">¿No tienes cuenta?</p>
          <button
            type="button"
            onClick={() => navigate("/registro")}
            className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
