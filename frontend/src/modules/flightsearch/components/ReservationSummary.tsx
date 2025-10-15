import React from 'react';
import type { CartTicket } from '../../../context/types';

interface ReservationSummaryProps {
  flight: any; // Reemplazar por tipo real de vuelo
  selectedClass: string;
  passengers: { name: string; lastName: string; dni: string; age: number }[];
  pricePerPerson: number;
  onReserve: () => void;
  onBuy: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  flight,
  selectedClass,
  passengers,
  pricePerPerson,
  onReserve,
  onBuy,
  loading,
  disabled = false,
}) => {
  return (
    <div className="p-6 rounded-xl bg-gray-50 border mt-6">
      <h2 className="font-bold text-xl mb-4">Resumen de reserva</h2>
      <div className="mb-2">Vuelo: <span className="font-semibold">{flight?.origin?.codigo_iata} → {flight?.destination?.codigo_iata}</span></div>
      <div className="mb-2">Clase: <span className="font-semibold">{selectedClass === 'economica' ? 'Económica' : 'Primera Clase'}</span></div>
      <div className="mb-2">Pasajeros: <span className="font-semibold">{passengers.length}</span></div>
      <div className="mb-2">Precio por persona: <span className="font-semibold">${pricePerPerson.toFixed(2)}</span></div>
      <div className="mb-2">Total: <span className="font-bold text-[#0F6899] text-xl">${(pricePerPerson * passengers.length).toFixed(2)}</span></div>
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className={`px-6 py-3 rounded-xl font-sans font-bold transition-all duration-300 shadow-lg ${
            disabled || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
              : 'bg-gradient-to-r from-[#39A5D8] to-[#0F6899] text-white border border-[#39A5D8]/50 hover:from-[#0F6899] hover:to-[#39A5D8] hover:border-[#39A5D8] hover:shadow-xl transform hover:scale-105'
          }`}
          onClick={onReserve}
          disabled={disabled || loading}
        >
          {loading ? 'Reservando...' : 'Reservar (24h sin pagar)'}
        </button>
        <button
          type="button"
          className={`px-6 py-3 rounded-xl font-sans font-bold transition-all duration-300 shadow-lg ${
            disabled || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
              : 'bg-gradient-to-r from-[#081225] via-[#123361] to-[#081225] text-white border border-[#39A5D8]/50 hover:from-[#123361] hover:via-[#081225] hover:to-[#123361] hover:border-[#39A5D8] hover:shadow-xl transform hover:scale-105'
          }`}
          onClick={onBuy}
          disabled={disabled || loading}
        >
          {loading ? 'Comprando...' : 'Comprar ahora'}
        </button>
      </div>
    </div>
  );
};

export default ReservationSummary;
