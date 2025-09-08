import { ShoppingCart, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Header() {
  return (
    <nav className="bg-black text-white px-8 py-4 flex items-center justify-between">
      {/* Logo y navegación */}
      <div className="flex items-center space-x-8">
        <img src={logo} alt="Logo" className="h-20 w-auto" />
        <div className="flex space-x-6 text-lg font-semibold">
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
      </div>

      {/* Iconos */}
      <div className="flex items-center space-x-6">
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

    </nav>
  );
}