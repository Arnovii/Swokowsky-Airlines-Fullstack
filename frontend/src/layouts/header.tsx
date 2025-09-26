// src/layouts/Header.tsx
import { ShoppingCart, Settings, User, Menu, X, LogOut, Newspaper, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  const usernameDisplay = auth.user?.username ?? auth.user?.correo ?? "Usuario";

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#081225] via-[#0a1533] to-[#081225] backdrop-blur-md border-b border-cyan-500/20 text-white px-6 py-4 z-50 shadow-2xl font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 group">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-auto transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
            </div>
            <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-cyan-100 transition-all duration-300">
              Swokowsky Airlines
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          <div className="relative">
            {open ? (
              <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>
        </button>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* News Icon */}
          <Link
            to="/news"
            className="flex items-center justify-center group relative overflow-hidden hover:text-cyan-300 transition-colors duration-300"
            title="Noticias"
          >
            <Newspaper className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {auth.isAuthenticated ? (
            <>
              {/* User Greeting */}
              <Link
                to="/perfil"
                className="flex items-center px-4 py-2.5 h-11 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 group"
              >
                <span className="text-sm text-cyan-200 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                  Hola, <span className="font-semibold text-white">{usernameDisplay}</span>
                  <span className="ml-1 inline-block group-hover:animate-bounce">👋</span>
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => auth.logout(true)}
                title="Cerrar sesión"
                className="flex items-center justify-center gap-2 px-4 py-2.5 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-300 group"
              >
                <LogOut className="h-5 w-5 text-red-300 group-hover:text-red-200 transition-all duration-300 group-hover:-translate-x-1" />
                <span className="text-sm text-red-300 group-hover:text-red-200 transition-colors duration-300 whitespace-nowrap">
                  Cerrar sesión
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Login Icon */}
              <Link
                to="/login"
                className="flex items-center justify-center group relative overflow-hidden hover:text-cyan-300 transition-colors duration-300"
                title="Iniciar sesión"
              >
                <User className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              {/* Login Text */}
              <Link
                to="/login"
                className="flex items-center px-4 py-2.5 h-11 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 group"
              >
                <span className="text-sm text-cyan-200 group-hover:text-white transition-colors duration-300 font-medium whitespace-nowrap">
                  Iniciar sesión
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${open
        ? 'max-h-96 opacity-100 translate-y-0'
        : 'max-h-0 opacity-0 -translate-y-4'
        }`}>
        <div className="mt-6 pt-6 border-t border-cyan-500/20">
          <div className="flex flex-col space-y-3">
            {/* News Link Mobile */}
            <Link
              to="/news"
              className="flex items-center space-x-3 p-4 h-14 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-400/30 transition-all duration-300 group"
              onClick={() => setOpen(false)}
            >
              <Newspaper className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 flex-shrink-0" />
              <span className="text-cyan-200 group-hover:text-white transition-colors duration-300 font-medium">
                Noticias
              </span>
            </Link>

            {auth.isAuthenticated ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center justify-center p-4 h-14 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 group"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-cyan-200 group-hover:text-white transition-colors duration-300 text-center">
                    Hola, <span className="font-semibold text-white">{usernameDisplay}</span>
                    <span className="ml-2 inline-block group-hover:animate-bounce">👋</span>
                  </span>
                </Link>

                <button
                  onClick={() => {
                    auth.logout(true);
                    setOpen(false);
                  }}
                  className="flex items-center space-x-3 p-4 h-14 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-red-500/10 hover:border-red-400/30 transition-all duration-300 group"
                >
                  <LogOut className="h-5 w-5 text-red-300 group-hover:text-red-200 transition-colors duration-300 flex-shrink-0" />
                  <span className="text-red-300 group-hover:text-red-200 transition-colors duration-300 font-medium">
                    Cerrar sesión
                  </span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-3 p-4 h-14 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 group"
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 flex-shrink-0" />
                <span className="text-cyan-200 group-hover:text-white transition-colors duration-300 font-medium">
                  Iniciar sesión
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
