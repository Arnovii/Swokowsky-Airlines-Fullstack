import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
      <section className="text-center px-6">
        {/* Círculo decorativo */}
        <div className="mb-8">
          <div className="mx-auto w-40 h-40 rounded-full bg-[#0e254d] flex items-center justify-center shadow-lg">
            <span className="text-white text-7xl font-bold">404</span>
          </div>
        </div>

        {/* Mensajes */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0e254d] mb-4">
          ¡Ups! Página no encontrada
        </h1>
        <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
          La página que buscas no existe o está en construcción.  
          Regresa al inicio para continuar navegando.
        </p>

        {/* Botón de regreso */}
        <Link
          to="/"
          className="inline-block bg-[#0e254d] hover:bg-[#0a1a3a] text-white px-6 py-3 rounded-xl text-lg font-medium transition-colors shadow-md"
        >
          Volver al Inicio
        </Link>
      </section>
    </main>
  );
}

