// src/components/FloatingSupportButton.tsx
import { Headphones } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FloatingSupportButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  // Solo mostrar para usuarios autenticados
  if (!auth.isAuthenticated) return null;

  const handleClick = () => {
    navigate("/chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      <div
        className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg border border-cyan-500/30 whitespace-nowrap transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        Chat de Soporte
        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/30 transform rotate-45"></div>
      </div>

      {/* Botón flotante */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Chat de Soporte"
      >
        {/* Efecto de pulso */}
        <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20"></span>
        
        {/* Icono */}
        <Headphones className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        
        {/* Indicador de disponible */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></span>
      </button>
    </div>
  );
}
