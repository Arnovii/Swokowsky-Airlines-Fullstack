import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logo from "@/assets/images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative backdrop-blur-2xl bg-black/60 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <img src={logo} alt="Swokowsky Airlines" className="h-40 mx-auto mb-4" />
        <h1 className="text-2xl font-title text-white tracking-wide">
          Swokowsky Airlines
        </h1>
        <p className="text-brand-cyan text-sm font-body">Bienvenido de vuelta</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          />
          {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white
             hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
        </div>

        {/* Remember me */}
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 text-white/80">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="accent-brand-cyan"
            />
            Recuérdame
          </label>
          <button className="text-brand-cyan hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-brand-cyan to-blue-600 py-4 rounded-2xl text-white font-title tracking-wide hover:from-blue-500 hover:to-brand-cyan transition-all"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-8 text-white/60 text-sm font-body">
        ¿No tienes cuenta?{" "}
        <button className="text-white
        hover:underline">Crear cuenta</button>
      </div>
    </div>
  );
}
