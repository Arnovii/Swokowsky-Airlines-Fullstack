import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn, FiUserPlus } from "react-icons/fi";
import { Plane } from "lucide-react";
import imagenFondo from "../../../assets/imagen_login.jpg";
import api from "../../../api/axios";

type ProfileResp = {
  id_usuario?: number;
  tipo_usuario?: string; // "root" | "admin" | "cliente"
  must_change_password?: boolean | string | number;
  [k: string]: any;
};

function toBool(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  return false;
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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // 1) Login (tu AuthContext debería guardar token en localStorage)
      await auth.login(email, password);

      // 2) Perfil actual (lee must_change_password desde DB)
      const { data } = await api.get<ProfileResp>("/profile");

      const mustChange = toBool(data?.must_change_password);
      const tipo = String(data?.tipo_usuario ?? "").toLowerCase();

      // 3) Redirecciones
      if (mustChange) {
        // Forzamos cambio de contraseña
        navigate("/ChangePassword", { replace: true });
        return;
      }

      if (tipo === "root") {
        navigate("/panelAdministrador/root", { replace: true });
        return;
      }
      if (tipo === "admin") {
        navigate("/panelAdministrador", { replace: true });
        return;
      }

      // cliente u otros
      navigate(from, { replace: true });
    } catch (err: any) {
      // Los 401 ya los maneja tu interceptor, aquí mostramos mensaje
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al iniciar sesión";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${imagenFondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay con degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#081225]/95 via-[#0a1533]/90 to-[#081225]/95 backdrop-blur-sm"></div>
      
      {/* Efectos decorativos */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card de login - Fondo blanco */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header del card */}
          <div className="bg-gradient-to-r from-[#081225] via-[#0a1533] to-[#081225] px-8 py-8 border-b border-cyan-500/20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-cyan-200/80 text-sm">
                Inicia sesión para continuar tu viaje
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-[#0a1533]" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@dominio.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-cyan-600 hover:text-cyan-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-[#0a1533]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#0a1533] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}

              {/* Botón Login */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0a1533] to-[#1a3a5c] text-white py-3.5 rounded-xl font-semibold hover:from-[#0d1d40] hover:to-[#1e4470] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-[#0a1533]/25 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿Nuevo en Swokowsky?</span>
              </div>
            </div>

            {/* Botón Registro */}
            <button
              type="button"
              onClick={() => navigate("/registro")}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-[#0a1533] py-3.5 rounded-xl font-semibold hover:bg-gray-100 hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 group"
            >
              <FiUserPlus className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
              <span>Crear una cuenta</span>
            </button>
          </div>
        </div>

        {/* Footer decorativo */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Plane className="w-4 h-4" />
            <span>Vuela con nosotros hacia tu próxima aventura</span>
          </div>
        </div>
      </div>
    </div>
  );
}
