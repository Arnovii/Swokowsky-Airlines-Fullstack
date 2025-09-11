import React from "react";
import FilterSearchBar from "./filterSearchBar";
import { Button } from "flowbite-react";
import heroBanner from "@/assets/imag2.jpg";

const HeroBanner: React.FC = () => {
  return (
    <div
      className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-cover bg-center"
      style={{ backgroundImage: `url('${heroBanner}')` }}
    >
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 sm:px-6 md:px-0">
        
        {/* Texto y botón */}
        <div className="text-center sm:text-left w-full max-w-2xl sm:max-w-4xl mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-sans leading-tight drop-shadow-lg tracking-wide">
            Tu próxima aventura comienza ahora.
          </h1>
          <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-sans drop-shadow-lg mt-3 mb-6 tracking-wide">
            Vuelos desde 2 millones
          </h2>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-sans py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg transition duration-300 ease-in-out">
            Reserva Ahora
          </Button>
        </div>

        {/* Buscador de vuelos */}
        <div className="w-full max-w-lg sm:max-w-2xl px-2 sm:px-0">
          <FilterSearchBar />
        </div>

      </div>
    </div>
  );
};

export default HeroBanner;
