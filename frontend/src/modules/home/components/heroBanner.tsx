import React from "react";
import FilterSearchBar from "./filterSearchBar";
import { Button } from "flowbite-react";
import heroBanner from "@/assets/imag2.jpg";

const HeroBanner: React.FC = () => {
  return (
    <section
      className="
        relative 
        min-h-[100vh] sm:min-h-[80vh] lg:min-h-[700px] 
        bg-cover bg-center flex items-center justify-center
      "
      style={{ backgroundImage: `url('${heroBanner}')` }}
    >
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 lg:px-12 text-white">

        {/* Texto y botón */}
        <div className="text-center max-w-3xl mb-10 pt-24 sm:pt-32">
          <h1
            className="
              font-sans font-extrabold leading-tight tracking-wide drop-shadow-lg
              text-[clamp(1.8rem,4vw,4rem)]
            "
          >
            Tu próxima aventura comienza ahora.
          </h1>

          <h2
            className="
              mt-3 mb-6 font-sans tracking-wide drop-shadow-lg
              text-[clamp(1rem,2.5vw,2.5rem)]
            "
          >
            Vuelos desde 2 millones
          </h2>

          <Button
            className="
              mx-auto
              px-8 py-4 bg-azul text-brand-white font-sans rounded-xl shadow-lg
              hover:bg-[#0e254d] transition-colors
              text-[clamp(1rem,1.5vw,1.25rem)]
            "
          >
            Reserva Ahora
          </Button>
        </div>

        {/* Buscador de vuelos */}
        <div className="w-full max-w-7xl px-2 sm:px-6 pb-8">
          <FilterSearchBar />
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;

