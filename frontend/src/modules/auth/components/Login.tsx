import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Plane } from "lucide-react";
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

    if (!email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Login exitoso:", { email, password });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8 group hover:shadow-blue-500/20 transition-all duration-700">
          {/* Shine Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Swokosky Airlines" className="h-16" />
            </div>
            <h1 className="text-2xl font-light text-white mb-1 tracking-wide">
              Swokosky Airlines
            </h1>
            <p className="text-white/60 text-sm font-light">Bienvenido de vuelta</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email */}
            <div className="relative">
              <div className={`relative transition-all duration-300 ${focusedInput === 'email' ? 'scale-[1.02]' : ''}`}>
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="correo@empresa.com"
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                      : focusedInput === 'email'
                      ? "border-blue-400 focus:border-blue-400 focus:ring-blue-400/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'scale-[1.02]' : ''}`}>
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 bg-white border rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                      : focusedInput === 'password'
                      ? "border-blue-400 focus:border-blue-400 focus:ring-blue-400/30"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="mr-2"
                />
                <span className="text-white/80 text-sm font-light">
                  Recuérdame
                </span>
              </label>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-light transition-colors duration-200 hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="relative w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-4 rounded-2xl transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/40 text-sm font-light">
              ¿No tienes cuenta?{" "}
              <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline">
                Crear cuenta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
