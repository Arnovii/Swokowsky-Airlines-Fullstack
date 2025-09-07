import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import logo from "@/assets/images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "El correo es obligatorio.";
    if (!password) newErrors.password = "La contraseña es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <img src={logo} alt="Swokosky Airlines" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-light text-white">Swokosky Airlines</h1>
        <p className="text-white/60 text-sm">Bienvenido de vuelta</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            placeholder="correo@empresa.com"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-gray-900"
          />
          {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            placeholder="••••••••"
            className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl text-gray-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
        </div>

        {/* Remember me */}
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-white/80 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Recuérdame
          </label>
          <button className="text-blue-400 text-sm hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-4 rounded-2xl text-white font-medium hover:from-blue-600 hover:to-cyan-600"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-8 text-white/40 text-sm">
        ¿No tienes cuenta?{" "}
        <button className="text-blue-400 hover:underline">Crear cuenta</button>
      </div>
    </div>
  );
}
