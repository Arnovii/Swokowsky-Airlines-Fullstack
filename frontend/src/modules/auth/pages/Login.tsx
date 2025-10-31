// src/modules/auth/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import imagenFondo from "../../../assets/imagen_login.jpg";
import api from "../../../api/axios";

type BackendUser = {
  id_usuario?: number;
  tipo_usuario?: "root" | "admin" | "cliente" | string;
  must_change_password?: boolean | string | number;
  [k: string]: any;
};

function toBool(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  return false;
}

// Normaliza distintas estructuras de respuesta y retorna un "user" plano
function extractUser(anyObj: any): BackendUser {
  if (!anyObj) return {};
  if (anyObj.user) return anyObj.user;            // { user: {...} }
  if (anyObj.data?.user) return anyObj.data.user; // { data: { user: {...} } }
  if (anyObj.data) return anyObj.data;            // { data: {...} }
  return anyObj;                                  // plano
}

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1) Login (AuthContext ya debería guardar token y opcionalmente user)
      const loginResp: any = await auth.login(email, password);

      // 2) Intento obtener el usuario de la respuesta del login
      let u: BackendUser = extractUser(loginResp);

      // 3) Refresco de perfil (recomendado) para asegurar must_change_password
      //    Si /auth/me no existe aún, este bloque hará catch silencioso.
      try {
        const me = await api.get("/auth/me");
        const meUser = extractUser(me);
        if (meUser && Object.keys(meUser).length) {
          u = meUser;
          // Persistimos para el resto de la app
          localStorage.setItem("swk_user", JSON.stringify(u));
        }
      } catch {
        // si falla, seguimos con el 'u' previo o con el guardado por el AuthContext
        if (!u || Object.keys(u).length === 0) {
          const ls = localStorage.getItem("swk_user");
          if (ls) {
            try {
              u = extractUser(JSON.parse(ls));
            } catch {}
          }
        }
      }

      // 4) Normalizaciones
      const mustChange = toBool(u?.must_change_password);
      const tipo = String(u?.tipo_usuario ?? "").toLowerCase();

      // 5) Flujo: cambio de contraseña forzado
      if (mustChange === true) {
        navigate("/ChangePassword", { replace: true });
        return;
      }

      // 6) Flujo por rol
      if (tipo === "root") {
        navigate("/panelAdministrador/root", { replace: true });
        return;
      }
      if (tipo === "admin") {
        navigate("/panelAdministrador", { replace: true });
        return;
      }

      // 7) Cliente u otros
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(${imagenFondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* halo blur decorativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-400 rounded-2xl blur-2xl opacity-50 -z-10"></div>

        {/* encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-gray-500">Inicia sesión para continuar</p>
        </div>

        {/* formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* email */}
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

          {/* contraseña */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* botón login */}
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
