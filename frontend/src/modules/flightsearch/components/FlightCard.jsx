import React from 'react';
import { Plane, Globe } from 'lucide-react';
import { FlightUtils } from '../utils/flightUtils';

export const FlightCard = ({ flight, onSelectFlight }) => {
  const finalPrice = FlightUtils.calculateFinalPrice(flight);

  const getPromoBadge = () => {
    if (!flight.promocion) return null;
    
    if (flight.promocion.cupoRestante <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-sans">
          Promoción agotada
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-green-600 text-white font-sans animate-pulse">
        🏷️ -{Math.round(flight.promocion.descuento_pet * 100)}% {flight.promocion.nombre}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Ruta y horarios */}
        <div className="flex-1">
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] font-sans">
                {FlightUtils.formatTime(flight.salida_programada)}
              </div>
              <div className="text-sm font-bold text-gray-600 font-sans">{flight.aeropuerto_origen.codigo_iata}</div>
              <div className="text-xs text-gray-500 font-sans">{flight.aeropuerto_origen.ciudad.nombre}</div>
            </div>
            
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 shadow-sm">
                <Plane size={18} className="text-blue-600 mb-1 mx-auto" />
                <div className="text-xs font-bold text-gray-600 font-sans">
                  {FlightUtils.formatDuration(flight.duracion_minutos)}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] flex items-center gap-2 font-sans">
                {FlightUtils.formatTime(flight.llegada_programada)}
                {flight.isInternational && <Globe size={18} className="text-blue-500" />}
              </div>
              <div className="text-sm font-bold text-gray-600 font-sans">{flight.aeropuerto_destino.codigo_iata}</div>
              <div className="text-xs text-gray-500 font-sans">{flight.aeropuerto_destino.ciudad.nombre}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold font-sans">{flight.aeronave.modelo}</span>
            </div>
            <div className="capitalize font-semibold font-sans text-gray-700">
              {flight.clases_disponibles.join(", ").replace("_", " ")}
            </div>
          </div>
        </div>

        {/* Precio y promoción */}
        <div className="flex flex-col lg:items-end gap-3 lg:w-64">
          <div className="flex flex-col items-start lg:items-end">
            {flight.promocion && flight.promocion.cupoRestante > 0 && (
              <span className="text-sm text-gray-500 line-through font-sans">
                {FlightUtils.formatPrice(flight.precio_base)}
              </span>
            )}
            <span className="text-4xl font-bold text-[#081225] font-sans bg-gradient-to-r from-[#081225] to-[#1a2332] bg-clip-text">
              {FlightUtils.formatPrice(finalPrice)}
            </span>
            <span className="text-sm text-gray-600 font-sans">por persona</span>
          </div>
          
          {getPromoBadge() && (
            <div className="mb-2">{getPromoBadge()}</div>
          )}
          
          <button 
            onClick={() => onSelectFlight(flight)}
            className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-[#081225] to-[#1a2332] text-white rounded-xl hover:from-[#1a2332] hover:to-[#081225] transition-all duration-300 font-bold font-sans shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            ✈️ Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};