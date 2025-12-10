// Modal para mostrar el mapa de asientos sin cambiar de página
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CheckinSeatMap from './CheckinSeatMap';
import checkinService, { type SeatMapResponse } from '../../checkin/services/checkinService';

interface SeatMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  idVuelo: number;
  passengerName: string;
  passengerIndex: number;
  currentAssignedSeat?: string | null;
  onSeatConfirmed: (seatId: string) => void;
}

const SeatMapModal: React.FC<SeatMapModalProps> = ({
  isOpen,
  onClose,
  idVuelo,
  passengerName,
  passengerIndex,
  currentAssignedSeat = null,
  onSeatConfirmed,
}) => {
  const [seatMapData, setSeatMapData] = useState<SeatMapResponse | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(currentAssignedSeat);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar asientos cuando se abre el modal
  useEffect(() => {
    if (isOpen && idVuelo) {
      loadSeats();
    }
  }, [isOpen, idVuelo]);

  // Resetear selección al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedSeat(currentAssignedSeat);
    }
  }, [isOpen, currentAssignedSeat]);

  const loadSeats = async () => {
    setLoading(true);
    setError(null);
    try {
      const seatMap = await checkinService.getSeatsForFlight(idVuelo);
      setSeatMapData(seatMap);
    } catch (err) {
      console.error('Error al cargar asientos:', err);
      setError('Error al cargar el mapa de asientos');
      toast.error('❌ Error al cargar los asientos del vuelo', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId);
  };

  const handleConfirm = () => {
    if (!selectedSeat) {
      toast.warning('⚠️ Por favor selecciona un asiento', { position: 'top-center' });
      return;
    }
    
    setConfirming(true);
    
    // Llamar al callback con el asiento seleccionado
    onSeatConfirmed(selectedSeat);
    
    toast.success(`✅ Asiento ${selectedSeat} seleccionado para ${passengerName}`, {
      position: 'top-center',
      autoClose: 2000,
    });
    
    setConfirming(false);
    onClose();
  };

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay oscuro */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1a4a7a] rounded-2xl shadow-2xl border border-cyan-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Seleccionar Asiento</h2>
            <p className="text-cyan-100 text-sm">
              Pasajero {passengerIndex + 1}: {passengerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white">Cargando mapa de asientos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadSeats}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : seatMapData ? (
            <div className="space-y-4">
              {/* Leyenda */}
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/80"></div>
                  <span className="text-sm text-slate-300">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500/80"></div>
                  <span className="text-sm text-slate-300">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500 ring-2 ring-cyan-300"></div>
                  <span className="text-sm text-slate-300">Seleccionado</span>
                </div>
                {currentAssignedSeat && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500/80"></div>
                    <span className="text-sm text-slate-300">Tu asiento actual</span>
                  </div>
                )}
              </div>

              {/* Mapa de asientos */}
              <CheckinSeatMap
                seatMap={seatMapData}
                selectedSeat={selectedSeat}
                currentAssignedSeat={currentAssignedSeat}
                onSeatSelect={handleSeatSelect}
                disabled={confirming}
              />

              {/* Asiento seleccionado */}
              {selectedSeat && (
                <div className="mt-4 text-center">
                  <p className="text-lg text-white">
                    Asiento seleccionado: <span className="font-bold text-cyan-400 text-2xl">{selectedSeat}</span>
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-cyan-500/20 flex justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSeat || confirming || loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
          >
            {confirming ? 'Confirmando...' : `Confirmar asiento ${selectedSeat || ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatMapModal;
