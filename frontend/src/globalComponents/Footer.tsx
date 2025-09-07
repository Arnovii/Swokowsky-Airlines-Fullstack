
import { Facebook, Twitter, Youtube } from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        
        {/* Logo + Marca */}
        <div className="flex items-center space-x-4">
          <span className="text-xl font-title font-semibold tracking-wide">
            SWOKOWSKY AIRLINES
          </span>
        </div>

        {/* Redes Sociales */}
        <div className="flex space-x-4 mt-6 md:mt-0">
          <a
            href="#"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-white transition-colors"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-white transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-white transition-colors"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} <span className="font-semibold">Swokowsky Airlines</span>. Todos los derechos reservados.  
        <br />
      </div>
    </footer>
  );
}

