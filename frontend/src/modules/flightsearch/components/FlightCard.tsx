import AddToCartButton from '../../../common/AddToCartButton';
import { Plane, Globe } from 'lucide-react';
import { FlightUtils, type Promotion } from '../utils/flightUtils';
import type { Flight } from '../types/Flight';

interface PromoBadgeProps {
  promotion?: Promotion;
}

const PromoBadge: React.FC<PromoBadgeProps> = ({ promotion }) => {
  if (!promotion) return null;
  if ((promotion.remainingSeats ?? 0) <= 0) {
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
  isSelected?: boolean; //  prop para indicar si el vuelo está seleccionado
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelectFlight, isSelected = false }) => {
  const finalPrice = FlightUtils.calculateFinalPrice(flight);

  return (
    <div className={`bg-white/95 backdrop-blur-lg rounded-2xl border p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg relative ${
      isSelected 
        ? 'border-green-500 ring-4 ring-green-400 shadow-2xl shadow-green-500/50' 
        : 'border-white/30 hover:border-[#39A5D8]/50'
    }`}>
      {/* Badge de selección */}
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Seleccionado
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Sección de Ruta y Horarios */}
        <div className="flex-1">
          <div className="flex items-center gap-6 mb-4">
            {/* ... (resto de la sección de ruta sin cambios) ... */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] font-sans">
                {FlightUtils.formatTime(flight.departureTimeUTC || '')}
              </div>
              <div className="text-sm font-bold text-[#0F6899] font-sans">{flight.origen?.codigoIata || ''}</div>
              <div className="text-xs text-gray-600 font-sans">{flight.origen?.ciudad || ''}</div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#39A5D8] to-transparent"></div>
              <div className="text-center bg-gradient-to-br from-[#eaf6ff] to-[#d8f0ff] rounded-xl p-3 shadow-sm border border-[#39A5D8]/20">
                <Plane size={18} className="text-[#0F6899] mb-1 mx-auto" />
                <div className="text-xs font-bold text-[#0F6899] font-sans">
                  {FlightUtils.formatDuration(flight.durationMinutes || 0)}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#39A5D8] to-transparent"></div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#081225] flex items-center gap-2 font-sans">
                {FlightUtils.formatTime(flight.arrivalTimeUTC || '')}
                {flight.isInternational && <Globe size={18} className="text-[#39A5D8]" />}
              </div>
              <div className="text-sm font-bold text-[#0F6899] font-sans">{flight.destino?.codigoIata || ''}</div>
              <div className="text-xs text-gray-600 font-sans">{flight.destino?.ciudad || ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#0F6899]/10 to-[#39A5D8]/10 px-3 py-1 rounded-full border border-[#39A5D8]/20">
              <div className="w-2 h-2 bg-[#39A5D8] rounded-full animate-pulse"></div>
              <span className="font-semibold font-sans text-[#0F6899]">{flight.aircraftModel || flight.modeloAeronave || ''}</span>
            </div>
            <span className="capitalize font-semibold font-sans text-[#081225]">
              {
                (flight.availableClasses && flight.availableClasses.length > 0)
                  ? flight.availableClasses.join(', ').replace('_', ' ')
                  : 'Clase no especificada'
              }
            </span>
          </div>
        </div>
        {/* Sección de Precio y Selección */}
        <div className="flex flex-col lg:items-end gap-3 lg:w-64">
          <div className="flex flex-col items-start lg:items-end">
            {flight.promotion && (
              <span className="text-sm text-gray-500 line-through font-sans">
                {FlightUtils.formatPrice(flight.price || 0)}
              </span>
            )}
            <span className="text-4xl font-bold text-[#081225] font-sans">
              {FlightUtils.formatPrice(finalPrice || 0)}
            </span>
            <span className="text-sm text-gray-600 font-sans">por persona</span>
          </div>
          <div className="mb-2">
            <PromoBadge promotion={flight.promotion} />
          </div>
          {/* MODIFICADO: El botón ahora cambia según isSelected */}
          <AddToCartButton 
            onClick={() => onSelectFlight(flight)}
            className={isSelected ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {isSelected ? 'Seleccionado ✓' : undefined}
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
};