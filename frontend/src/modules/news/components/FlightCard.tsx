
import React from 'react';
import { Plane, Clock, Users, Globe, MapPin } from 'lucide-react';
import type { Flight } from '../hooks/useFlights';
import { Link } from "react-router-dom"

interface FlightCardProps {
  flight: Flight;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getAvailabilityStatus = (seats: number) => {
    if (seats <= 5) return { text: 'Últimas plazas', color: 'text-red-600 bg-red-50' };
    if (seats <= 15) return { text: 'Pocas plazas', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Disponible', color: 'text-green-600 bg-green-50' };
  };

  const availability = getAvailabilityStatus(flight.availableSeats ?? 0);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Imagen de destino */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-600">
        <img
          src={flight.image}
          alt={`${flight.origin} - ${flight.destination}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3">
          {flight.isInternational && (
            <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              <Globe size={12} />
              Internacional
            </span>
          )}
        </div>

        {flight.promotion && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{flight.promotion.discount}% OFF
          </div>
        )}

        {/* Overlay con ruta */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-lg font-bold font-sans">{flight.originCode}</span>
            <Plane size={16} className="mx-2" />
            <span className="text-lg font-bold font-sans">{flight.destinationCode}</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Ruta completa */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#081225] font-sans mb-1">
            {flight.origin} → {flight.destination}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span className="font-sans">{flight.airline ?? flight.aircraft} • {flight.aircraft}</span>
          </div>
        </div>

        {/* Horarios */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-[#081225] font-sans">{flight.departureTime}</div>
            <div className="text-xs text-gray-600 font-sans">Salida</div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={14} />
            <span className="text-xs font-sans">{flight.duration}</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#081225] font-sans">{flight.arrivalTime}</div>
            <div className="text-xs text-gray-600 font-sans">Llegada</div>
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className={availability.color.includes('red') ? 'text-red-600' : availability.color.includes('orange') ? 'text-orange-600' : 'text-green-600'} />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${availability.color}`}>
            {availability.text} ({flight.availableSeats ?? 0} asientos)
          </span>
        </div>

        {/* Precio */}
        <div className="mb-4">
          {flight.promotion ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 line-through font-sans">
                {formatPrice(flight.promotion.originalPrice)}
              </span>
              <span className="text-xl font-bold text-green-600 font-sans">
                {formatPrice(flight.price)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-[#081225] font-sans">
              {formatPrice(flight.price)}
            </span>
          )}
          <div className="text-xs text-gray-500 font-sans">por persona</div>
        </div>

        {/* Botón */}
        <Link
          to={`/noticias/vuelo/${flight.id}`} // usa el id real de la oferta
          className="inline-block bg-[#0e254d] text-white px-4 py-2 rounded font-sans hover:bg-[#0a1a3a] transition-colors w-full text-center"
        >
          Seleccionar Vuelo
        </Link>
      </div>
    </div>
  );
};

export default FlightCard;