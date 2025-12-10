import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import checkinService, { type SeatMapResponse } from '../../checkin/services/checkinService';
import CheckinSeatMap from '../components/CheckinSeatMap';

const SeatMapPage = () => {
  const { id_vuelo } = useParams<{ id_vuelo: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Detectar si viene del flujo de check-in
  const isCheckinFlow = searchParams.get('checkin') === 'true';
  
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seatMapData, setSeatMapData] = useState<SeatMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Datos de la sesión de check-in (se obtiene UNA vez al montar)
  const [checkinSession] = useState(() => checkinService.getSession());

  // Verificar sesión de check-in solo al montar el componente
  useEffect(() => {
    if (isCheckinFlow && !checkinSession && !isNavigating) {
      toast.error('❌ Sesión de check-in no encontrada. Inicia el proceso nuevamente.', { position: 'top-center' });
      navigate('/checkin');
    }
  }, []);

  // Cargar asientos ocupados desde el backend
  useEffect(() => {
    const fetchSeats = async () => {
      if (!id_vuelo) {
        setError('No se proporcionó ID de vuelo');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const seatMap = await checkinService.getSeatsForFlight(parseInt(id_vuelo, 10));
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

    fetchSeats();
  }, [id_vuelo]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId);
    toast.success(`✅ Asiento ${seatId} seleccionado`, {
      position: 'top-center',
      autoClose: 2000,
    });
  };

  // Confirmar check-in con el asiento seleccionado
  const handleConfirmCheckin = async () => {
    console.log('🔍 Iniciando confirmación de check-in...');
    console.log('🔍 Asiento seleccionado:', selectedSeat);
    console.log('🔍 Sesión de check-in:', checkinSession);
    
    if (!selectedSeat) {
      toast.warning('⚠️ Por favor selecciona un asiento', { position: 'top-center' });
      return;
    }

    if (!checkinSession) {
      toast.error('❌ Sesión de check-in no encontrada. Vuelve a iniciar el proceso.', { position: 'top-center' });
      navigate('/checkin');
      return;
    }

    if (!checkinSession.ticketId) {
      toast.error('❌ No se encontró el ID del ticket. Vuelve a iniciar el proceso.', { position: 'top-center' });
      navigate('/checkin');
      return;
    }

    setConfirming(true);

    try {
      // Paso 1: Asignar el asiento al ticket (ahora incluye ticketId)
      console.log('🔍 Paso 1: Asignando asiento...');
      await checkinService.assignSeat(checkinSession.codigo_unico, checkinSession.ticketId, selectedSeat);
      console.log('✅ Asiento asignado');
      toast.success('✅ Asiento asignado correctamente', { position: 'top-center' });

      // Paso 2: Confirmar el check-in (ahora incluye ticketId)
      console.log('🔍 Paso 2: Confirmando check-in...');
      const result = await checkinService.confirmCheckin(checkinSession.codigo_unico, checkinSession.ticketId);
      console.log('✅ Check-in confirmado:', result);
      
      // Preparar datos para navegación ANTES de limpiar la sesión
      // Ahora usamos los datos completos del backend (origen, destino, pasajero, etc.)
      const navigationState = { 
        checkinCompleted: true, 
        ticketId: result.ticketId,
        asiento: result.asiento,
        pasajero: result.pasajero || checkinSession.pasajero,
        vuelo: result.vuelo,
        codigoReserva: result.codigoReserva,
      };
      console.log('🔍 Navegando a /checkin/confirmacion con estado:', navigationState);
      
      // Marcar que estamos navegando para evitar el toast de error
      setIsNavigating(true);
      
      // Limpiar sesión de check-in
      checkinService.clearSession();
      
      toast.success('🎉 ¡Check-in completado exitosamente!', { 
        position: 'top-center',
        autoClose: 3000,
      });

      // Navegar a la página de confirmación con todos los datos
      navigate('/checkin/confirmacion', { state: navigationState, replace: true });

    } catch (err: unknown) {
      console.error('❌ Error en check-in:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message || 'Error al confirmar el check-in';
      toast.error(`❌ ${message}`, { position: 'top-center' });
    } finally {
      setConfirming(false);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1a4a7a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#39A5D8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando mapa de asientos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !seatMapData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1a4a7a] flex items-center justify-center">
        <div className="text-center bg-red-500/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Error</h2>
          <p className="text-red-300">{error || 'No se pudieron cargar los asientos'}</p>
          <button
            onClick={() => navigate('/checkin')}
            className="mt-4 px-4 py-2 bg-cyan-500 text-slate-900 rounded-xl font-semibold hover:bg-cyan-400 transition-all"
          >
            Volver al check-in
          </button>
        </div>
      </div>
    );
  }

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
            {isCheckinFlow 
              ? 'Selecciona tu asiento para completar el check-in'
              : 'Selecciona tu asiento preferido para tu vuelo'
            }
          </p>
        </div>

        {/* Información del check-in */}
        {isCheckinFlow && checkinSession && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-cyan-500/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-cyan-300 text-sm font-medium">Check-in en proceso</p>
                <p className="text-white font-semibold">{checkinSession.pasajero.nombre}</p>
                <p className="text-slate-400 text-sm">Ticket #{checkinSession.ticketId}</p>
              </div>
              {/* Mostrar asiento actual asignado */}
              {checkinSession.asientoComprado && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-green-300 text-xs font-medium">Tu asiento actual</p>
                    <p className="text-white font-bold text-lg">{checkinSession.asientoComprado}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/30 border-2 border-green-400 rounded-lg flex items-center justify-center">
                    <span className="text-green-200 font-bold">{checkinSession.asientoComprado}</span>
                  </div>
                </div>
              )}
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-200 text-xs font-medium">
                Pendiente de confirmar
              </span>
            </div>
          </div>
        )}

        {/* Información del asiento seleccionado */}
        {selectedSeat && (
          <div className="bg-gradient-to-r from-[#39A5D8]/20 to-[#1180B8]/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#39A5D8]/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#39A5D8] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/30">
                  <span className="text-white font-bold text-xl">{selectedSeat}</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">Asiento Seleccionado</h4>
                  <p className="text-[#39A5D8] text-sm">
                    {selectedSeat.startsWith('P') ? '✨ Primera Clase' : '🌿 Clase Económica'}
                  </p>
                </div>
              </div>
              
              {isCheckinFlow && (
                <button
                  onClick={handleConfirmCheckin}
                  disabled={confirming}
                  className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {confirming ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirmando...
                    </>
                  ) : (
                    <>
                      ✓ Confirmar Check-in
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mapa de asientos del check-in */}
        <CheckinSeatMap
          seatMap={seatMapData}
          selectedSeat={selectedSeat}
          currentAssignedSeat={checkinSession?.asientoComprado || null}
          onSeatSelect={handleSeatSelect}
          disabled={confirming}
        />

        {/* Botones de navegación */}
        {isCheckinFlow && (
          <div className="mt-8 flex justify-between gap-4">
            <button
              onClick={() => navigate('/checkin')}
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/80 transition-all"
            >
              ← Volver al check-in
            </button>
            
            {selectedSeat && (
              <button
                onClick={handleConfirmCheckin}
                disabled={confirming}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/40 disabled:opacity-50"
              >
                {confirming ? 'Confirmando...' : 'Confirmar Check-in'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapPage;