import { useState } from 'react';
import SeatMap from '../components/SeatMap';
import type { Seat, SeatMapConfig } from '../components/SeatMap';
import { toast } from 'react-toastify';

const SeatMapPage = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [flightType, setFlightType] = useState<'nacional' | 'internacional'>('nacional');
  const [passengerClass, setPassengerClass] = useState<'primera' | 'economica' | undefined>(undefined);
  const [hasChangedSeat, setHasChangedSeat] = useState(false);

  // Simular asientos ocupados (en producción vendría del backend)
  const occupiedSeats = [
    '1A', '1B', '2C', '3D', '4E', '5F',
    '10A', '10B', '11C', '11D',
    '15A', '15B', '15C', '20D', '20E', '20F',
    '8A', '8B', '12C', '12D', '18E', '18F'
  ];

  const handleSeatSelect = (seat: Seat) => {
    // Validar si ya cambió asiento (solo 1 cambio permitido)
    if (hasChangedSeat && selectedSeat) {
      toast.warning('⚠️ Solo puedes cambiar tu asiento una vez', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    const previousSeat = selectedSeat;
    setSelectedSeat(seat.id);

    // Si ya tenía un asiento y seleccionó otro, marcar como cambio usado
    if (previousSeat && previousSeat !== seat.id) {
      setHasChangedSeat(true);
      toast.success(`✅ Asiento cambiado de ${previousSeat} a ${seat.id}`, {
        position: 'top-center',
        autoClose: 3000,
      });
    } else if (!previousSeat) {
      toast.success(`✅ Asiento ${seat.id} seleccionado`, {
        position: 'top-center',
        autoClose: 2000,
      });
    }
  };

  const config: SeatMapConfig = {
    tipo: flightType,
    occupiedSeats,
    selectedSeat,
    passengerClass,
  };

  const resetSelection = () => {
    setSelectedSeat(null);
    setHasChangedSeat(false);
    toast.info('🔄 Selección reiniciada', { position: 'top-center', autoClose: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1a4a7a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#39A5D8] to-[#1180B8] rounded-full mb-4 shadow-2xl shadow-[#39A5D8]/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            MAPA DE ASIENTOS
          </h1>
          <p className="text-[#39A5D8] text-lg font-medium">
            Selecciona tu asiento preferido para tu vuelo
          </p>
        </div>

        {/* Información del asiento seleccionado */}
        {selectedSeat && (
          <div className="bg-gradient-to-r from-[#39A5D8]/20 to-[#1180B8]/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#39A5D8]/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#39A5D8] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/30">
                  <span className="text-white font-bold text-2xl">{selectedSeat}</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">Asiento Seleccionado</h4>
                  <p className="text-[#39A5D8] text-sm">
                    {selectedSeat.match(/\d+/)?.[0] && parseInt(selectedSeat.match(/\d+/)![0]) <= (flightType === 'nacional' ? 4 : 8) 
                      ? '✨ Primera Clase' 
                      : '🌿 Clase Económica'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {hasChangedSeat ? (
                  <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-sm font-medium">
                    ⚠️ Ya usaste tu cambio de asiento
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-medium">
                    ✅ Puedes cambiar 1 vez más
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mapa de asientos */}
        <SeatMap
          config={config}
          onSeatSelect={handleSeatSelect}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default SeatMapPage;
