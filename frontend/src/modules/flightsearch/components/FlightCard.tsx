import React from 'react';
import { Plane, Globe } from 'lucide-react';
import { FlightUtils } from '../utils/flightUtils';

// Tipos para la promoción y vuelo
interface Promotion {
  name: string;
  discount: number;
  remainingSeats: number;
}

interface Flight {
  departureTimeUTC: string;
  arrivalTimeUTC: string;
  durationMinutes: number;
  origin?: {
    codigo_iata?: string;
    ciudad?: string;
  };
  destination?: {
    codigo_iata?: string;
    ciudad?: string;
  };
  aircraftModel?: string;
  availableClasses?: string[];
  isInternational?: boolean;
  price: number;
  promotion?: Promotion;
  // Puedes agregar más campos según tu modelo
}

interface PromoBadgeProps {
  promotion?: Promotion;
}

const PromoBadge: React.FC<PromoBadgeProps> = ({ promotion }) => {
  if (!promotion) return null;
  if (promotion.remainingSeats <= 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-sans">
        Promoción agotada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-green-600 text-white font-sans animate-pulse">
      🏷️ -{Math.round(promotion.discount * 100)}% {promotion.name}
    </span>
  );
};

interface FlightCardProps {
  flight: Flight;
  onSelectFlight: (flight: Flight) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelectFlight }) => {
  const finalPrice = FlightUtils.calculateFinalPrice(flight);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Sección de Ruta y Horarios */}
        <div className="flex-1">
          <div className="flex items-center gap-6 mb-4">
            {/* ... (resto de la sección de ruta sin cambios) ... */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] font-sans">
                {FlightUtils.formatTime(flight.departureTimeUTC)}
              </div>
              <div className="text-sm font-bold text-gray-600 font-sans">{flight.origin?.codigo_iata}</div>
              <div className="text-xs text-gray-500 font-sans">{flight.origin?.ciudad}</div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 shadow-sm">
                <Plane size={18} className="text-blue-600 mb-1 mx-auto" />
                <div className="text-xs font-bold text-gray-600 font-sans">
                  {FlightUtils.formatDuration(flight.durationMinutes)}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] flex items-center gap-2 font-sans">
                {FlightUtils.formatTime(flight.arrivalTimeUTC)}
                {flight.isInternational && <Globe size={18} className="text-blue-500" />}
              </div>
              <div className="text-sm font-bold text-gray-600 font-sans">{flight.destination?.codigo_iata}</div>
              <div className="text-xs text-gray-500 font-sans">{flight.destination?.ciudad}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold font-sans">{flight.aircraftModel}</span>
            </div>
            <span className="capitalize font-semibold font-sans text-gray-700">
              {
                (flight.availableClasses && flight.availableClasses.length > 0)
                  ? flight.availableClasses.join(', ').replace('_', ' ')
                  : 'Clase no especificada'
              }
            </span>
          </div>
        </div>
        {/* Sección de Precio y Selección (sin cambios) */}
        <div className="flex flex-col lg:items-end gap-3 lg:w-64">
          <div className="flex flex-col items-start lg:items-end">
            {flight.promotion && (
              <span className="text-sm text-gray-500 line-through font-sans">
                {FlightUtils.formatPrice(flight.price)}
              </span>
            )}
            <span className="text-4xl font-bold text-[#081225] font-sans bg-gradient-to-r from-[#081225] to-[#1a2332] bg-clip-text">
              {FlightUtils.formatPrice(finalPrice)}
            </span>
            <span className="text-sm text-gray-600 font-sans">por persona</span>
          </div>
          <div className="mb-2">
            <PromoBadge promotion={flight.promotion} />
          </div>
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
