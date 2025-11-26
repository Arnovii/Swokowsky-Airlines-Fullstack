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

        {/* Controles de demostración */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Opciones de visualización
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de vuelo */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Tipo de vuelo
              </label>
              <select
                value={flightType}
                onChange={(e) => {
                  setFlightType(e.target.value as 'nacional' | 'internacional');
                  setSelectedSeat(null);
                  setHasChangedSeat(false);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-[#39A5D8]"
              >
                <option value="nacional" className="text-slate-800">Nacional (150 asientos)</option>
                <option value="internacional" className="text-slate-800">Internacional (250 asientos)</option>
              </select>
            </div>

            {/* Clase del pasajero */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Filtrar por clase
              </label>
              <select
                value={passengerClass || ''}
                onChange={(e) => setPassengerClass(e.target.value as 'primera' | 'economica' | undefined || undefined)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-[#39A5D8]"
              >
                <option value="" className="text-slate-800">Todas las clases</option>
                <option value="primera" className="text-slate-800">Solo Primera Clase</option>
                <option value="economica" className="text-slate-800">Solo Económica</option>
              </select>
            </div>

            {/* Botón reiniciar */}
            <div className="flex items-end">
              <button
                onClick={resetSelection}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
              >
                🔄 Reiniciar selección
              </button>
            </div>
          </div>
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

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">✈️</span> Vuelo Nacional
            </h4>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• <strong className="text-purple-400">Primera Clase:</strong> Asientos 1-25</li>
              <li>• <strong className="text-emerald-400">Económica:</strong> Asientos 26-150</li>
              <li>• Capacidad total: 150 pasajeros</li>
            </ul>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">🌍</span> Vuelo Internacional
            </h4>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• <strong className="text-purple-400">Primera Clase:</strong> Asientos 1-50</li>
              <li>• <strong className="text-emerald-400">Económica:</strong> Asientos 51-250</li>
              <li>• Capacidad total: 250 pasajeros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMapPage;
