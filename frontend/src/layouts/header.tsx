// src/layouts/Header.tsx  (o src/components/Header.tsx) - adaptado a tu código
import { ShoppingCart, Settings, User, Menu, X, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  const usernameDisplay = auth.user?.username ?? auth.user?.correo ?? "Usuario";

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#081225] text-white px-6 py-4 flex items-center justify-between z-50 shadow-lg font-sans">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="h-14 w-auto cursor-pointer hover:opacity-80 transition"
          />
          <span className="text-2xl font-bold tracking-wide hover:text-cyan-400 transition">
            Swokowsky Airlines
          </span>
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden block text-white"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {/* Desktop nav links */}
      <div className="hidden lg:flex items-center space-x-8 text-lg font-semibold">
        <Link to="/news" className="hover:text-cyan-400">
          Noticias
        </Link>
        <Link to="/reserva" className="hover:text-cyan-400">
          Reserva y Check-in
        </Link>
        <Link to="/buscar-vuelos" className="hover:text-cyan-400">
          Buscar vuelos
        </Link>
      </div>

      {/* Icons / user area (desktop) */}
      <div className="hidden lg:flex items-center space-x-6">
        {auth.isAuthenticated ? (
          <>
            <Link to="/perfil" className="hover:text-cyan-400">
              Hola, <span className="font-bold">{usernameDisplay}</span> 👋
            </Link>

            <Link to="/carrito">
              <ShoppingCart className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>
            <Link to="/configuracion">
              <Settings className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>

            {/* Logout button */}
            <button
              onClick={() => auth.logout(true)}
              title="Cerrar sesión"
              className="flex items-center gap-2 hover:text-cyan-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Cerrar sesión</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <User className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>
            <Link to="/login" className="hover:text-cyan-400">Iniciar sesión</Link>
          </>
        )}
      </div>

      {/* Mobile dropdown (when open) */}
      {open && (
        <div className="absolute top-20 left-0 w-full bg-black flex flex-col items-center space-y-4 py-6 lg:hidden font-sans">
          <Link to="/news" className="hover:text-cyan-400">
            Noticias
          </Link>
          <Link to="/reserva" className="hover:text-cyan-400">
            Reserva y Check-in
          </Link>
          <Link to="/buscar-vuelos" className="hover:text-cyan-400">
            Buscar vuelos
          </Link>

          <div className="flex space-x-6 mt-4">
            <Link to="/carrito">
              <ShoppingCart className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>
            <Link to="/configuracion">
              <Settings className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>

            {auth.isAuthenticated ? (
              <>
                <Link to="/perfil" className="hover:text-cyan-400">
                  Hola, {usernameDisplay}
                </Link>
                <button onClick={() => auth.logout(true)} className="hover:text-cyan-400">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-cyan-400">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
