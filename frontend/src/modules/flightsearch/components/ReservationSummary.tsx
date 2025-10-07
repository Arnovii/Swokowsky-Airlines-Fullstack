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
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  flight,
  selectedClass,
  passengers,
  pricePerPerson,
  onReserve,
  onBuy,
  loading,
}) => {
  return (
    <div className="p-6 rounded-xl bg-gray-50 border mt-6">
      <h2 className="font-bold text-xl mb-4">Resumen de reserva</h2>
      <div className="mb-2">Vuelo: <span className="font-semibold">{flight?.origin?.codigo_iata} → {flight?.destination?.codigo_iata}</span></div>
      <div className="mb-2">Clase: <span className="font-semibold">{selectedClass === 'economica' ? 'Económica' : 'Primera Clase'}</span></div>
      <div className="mb-2">Pasajeros: <span className="font-semibold">{passengers.length}</span></div>
      <div className="mb-2">Precio por persona: <span className="font-semibold">${pricePerPerson.toFixed(2)}</span></div>
      <div className="mb-2">Total: <span className="font-bold text-blue-600">${(pricePerPerson * passengers.length).toFixed(2)}</span></div>
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className="px-6 py-3 rounded-xl font-sans font-bold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/40 transition-all duration-300 group text-[#081225]"
          onClick={onReserve}
          disabled={loading}
        >
          Reservar (24h sin pagar)
        </button>
        <button
          type="button"
          className="px-6 py-3 rounded-xl font-sans font-bold bg-[#081225] text-white border border-cyan-400/20 hover:bg-[#081225]/90 transition-all duration-300 group"
          onClick={onBuy}
          disabled={loading}
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
};

export default ReservationSummary;
