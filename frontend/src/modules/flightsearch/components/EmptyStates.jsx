import React from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate




export const NoFlightsFound = ({ onClearFilters }) => {
  const navigate = useNavigate(); // Usamos useNavigate para la navegación

  const handleClearFilters = () => {
    // Aquí podrías ejecutar onClearFilters si es necesario

    
    // Luego redirigir a la página de inicio
    navigate('/'); // Asumiendo que la página de inicio es la ruta "/"
  };

  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
      <div className="mb-6">
        <Search size={64} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#081225] mb-3 font-sans">
          No se encontraron vuelos
        </h3>
        <p className="text-gray-600 max-w-md mx-auto font-sans">
          No se encontraron vuelos que coincidan con los criterios seleccionados.
          Intenta ajustar los filtros para ver más opciones.
        </p>
      </div>
      <button
        onClick={handleClearFilters} // Cambiar la función onClick
                className="px-8 py-3 bg-gradient-to-r from-[#081225] to-[#1a2332] text-white rounded-xl hover:from-[#1a2332] hover:to-[#081225] transition-all duration-200 font-bold font-sans shadow-md hover:shadow-lg cursor-pointer" 
      >
        🔄 Volver a la página de inicio
      </button>
    </div>
  );
};

export const ErrorState = ({ error, onRetry }) => (
  <div className="bg-white rounded-2xl p-12 text-center border border-red-200">
    <div className="mb-6">
      <AlertTriangle size={64} className="text-red-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-red-600 mb-3 font-sans">
        Error al cargar vuelos
      </h3>
      <p className="text-red-500 max-w-md mx-auto font-sans mb-4">
        {error || 'Ocurrió un error inesperado al buscar vuelos.'}
      </p>
    </div>
    <button
      onClick={onRetry}
      className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-bold font-sans shadow-md hover:shadow-lg"
    >
      🔄 Reintentar
    </button>
  </div>
);

export const LoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center space-y-2">
                <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-gray-200"></div>
                <div className="w-16 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 h-0.5 bg-gray-200"></div>
              </div>
              <div className="text-center space-y-2">
                <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="lg:w-64 space-y-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-12 w-full bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);