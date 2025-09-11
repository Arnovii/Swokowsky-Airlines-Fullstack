import { ShoppingCart, Settings, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white px-6 py-4 flex items-center justify-between z-50 shadow-lg font-sans">
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

      {/* Botón menú hamburguesa (solo en móviles) */}
      <button
        className="lg:hidden block text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {/* Menú de navegación (desktop) */}
      <div className="hidden lg:flex items-center space-x-8 text-lg font-semibold">
        <Link to="/noticias" className="hover:text-cyan-400">
          Noticias
        </Link>
        <Link to="/reserva" className="hover:text-cyan-400">
          Reserva y Check-in
        </Link>
        <Link to="/buscar-vuelos" className="hover:text-cyan-400">
          Buscar vuelos
        </Link>
      </div>

      {/* Iconos (desktop) */}
      <div className="hidden lg:flex items-center space-x-6">
        <Link to="/carrito">
          <ShoppingCart className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
        </Link>
        <Link to="/configuracion">
          <Settings className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
        </Link>
        <Link to="/login">
          <User className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
        </Link>
      </div>

      {/* Menú desplegable (móvil) */}
      {open && (
        <div className="absolute top-20 left-0 w-full bg-black flex flex-col items-center space-y-4 py-6 lg:hidden font-sans">
          <Link to="/noticias" className="hover:text-cyan-400">
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
            <Link to="/login">
              <User className="h-6 w-6 hover:text-cyan-400 cursor-pointer" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
