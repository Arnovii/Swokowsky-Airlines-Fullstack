// Página de confirmación de check-in completado
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

interface VueloInfo {
  id: number;
  origen: {
    aeropuerto: string;
    codigo: string;
    ciudad: string;
  };
  destino: {
    aeropuerto: string;
    codigo: string;
    ciudad: string;
  };
  salida: string;
  llegada: string;
}

interface PassengerSeat {
  nombre: string;
  asiento: string;
  dni?: string;
  ticketId?: number;
}

interface CheckinConfirmationState {
  ticketId: number;
  asiento: string;
  pasajero?: {
    nombre: string;
    dni: string;
  };
  vuelo?: VueloInfo;
  codigoReserva?: string;
  // Nuevos campos para check-in grupal
  totalPassengers?: number;
  allSeats?: PassengerSeat[];
}

const CheckinConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationReady, setAnimationReady] = useState(false);

  const state = location.state as CheckinConfirmationState | null;

  useEffect(() => {
    if (!state?.ticketId) {
      navigate('/checkin');
      return;
    }
    setTimeout(() => setAnimationReady(true), 100);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  if (!state?.ticketId) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    return date.toLocaleString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generar URL para el QR con query parameters
  // En desarrollo local, usa VITE_FRONTEND_URL para acceso desde teléfonos
  // En producción, usa window.location.origin automáticamente
  const getBaseUrl = () => {
    // En producción, usar el dominio real
    if (!import.meta.env.DEV) {
      return window.location.origin;
    }
    
    // En desarrollo, si hay una URL configurada, usarla
    if (import.meta.env.VITE_FRONTEND_URL) {
      return import.meta.env.VITE_FRONTEND_URL;
    }
    
    // Si no hay URL configurada, usar la URL actual (funciona si accedes desde la IP)
    // Si el hostname no es localhost, usar el origin actual
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    
    // Fallback a localhost
    return window.location.origin;
  };

  const generateBoardingPassUrl = (passengerName?: string, passengerDni?: string, seat?: string, ticketId?: number) => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
      ticketId: (ticketId || state.ticketId).toString(),
      pasajero: encodeURIComponent(passengerName || state.pasajero?.nombre || 'Pasajero'),
      dni: passengerDni || state.pasajero?.dni || '',
      asiento: seat || state.asiento,
      vuelo: (state.vuelo?.id || state.ticketId).toString(),
      origenCodigo: state.vuelo?.origen?.codigo || '',
      origenCiudad: state.vuelo?.origen?.ciudad || '',
      origenAeropuerto: state.vuelo?.origen?.aeropuerto || '',
      destinoCodigo: state.vuelo?.destino?.codigo || '',
      destinoCiudad: state.vuelo?.destino?.ciudad || '',
      destinoAeropuerto: state.vuelo?.destino?.aeropuerto || '',
      salida: state.vuelo?.salida || '',
      llegada: state.vuelo?.llegada || '',
      codigoReserva: state.codigoReserva || '',
    });
    return `${baseUrl}/checkin/boarding-pass?${params.toString()}`;
  };

  const qrUrl = generateBoardingPassUrl();

  const recommendations = [
    {
      icon: '🕐',
      title: 'Llega con tiempo',
      description: 'Preséntate en el aeropuerto al menos 2 horas antes para vuelos nacionales y 3 horas para internacionales.',
    },
    {
      icon: '🪪',
      title: 'Documentos listos',
      description: 'Ten a la mano tu documento de identidad y la tarjeta de embarque (física o digital).',
    },
    {
      icon: '🧳',
      title: 'Equipaje',
      description: 'Recuerda las restricciones de equipaje de mano: máximo 10kg y líquidos en envases de 100ml.',
    },
    {
      icon: '📱',
      title: 'Tarjeta de embarque',
      description: 'Puedes mostrar tu tarjeta de embarque desde tu celular o imprimirla antes del vuelo.',
    },
    {
      icon: '🚫',
      title: 'Artículos prohibidos',
      description: 'No lleves objetos cortantes, líquidos inflamables o baterías de litio sueltas.',
    },
    {
      icon: '✈️',
      title: 'En el avión',
      description: 'Mantén tu cinturón abrochado durante todo el vuelo y sigue las instrucciones de la tripulación.',
    },
  ];

  const confettiItems = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${Math.random() * 3 + 2}s`,
    color: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
  }));

  const cardClass = animationReady ? 'animate-fade-in-up' : 'opacity-0';
  const scaleClass = animationReady ? 'animate-scale-in' : 'opacity-0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0a1628] to-[#020617] text-white py-8 px-4 relative overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-check { stroke-dasharray: 50; stroke-dashoffset: 50; animation: check-draw 0.5s ease-out 0.5s forwards; }
        .confetti-piece { animation: confetti-fall linear forwards; }
      `}</style>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiItems.map((item) => (
            <div
              key={item.id}
              className="absolute w-3 h-3 rounded-full confetti-piece"
              style={{
                left: item.left,
                backgroundColor: item.color,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className={`text-center mb-10 ${scaleClass}`}>
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-6 shadow-2xl shadow-emerald-500/40">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path className="animate-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            ¡Check-in Completado!
          </h1>
          <p className="text-lg text-slate-300">Tu check-in se ha realizado exitosamente. ¡Buen viaje!</p>
        </div>

        <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 overflow-hidden mb-8 ${cardClass}`} style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">✈️</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Swokowsky Airlines</h2>
                  <p className="text-emerald-100 text-xs">Tarjeta de Embarque Digital</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-xs">Código de Reserva</p>
                <p className="text-white font-mono font-bold text-lg tracking-wider">
                  {state.codigoReserva?.toUpperCase() || `#${state.ticketId}`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Mostrar todos los pasajeros si hay más de uno */}
            {state.allSeats && state.allSeats.length > 1 ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Pasajeros ({state.allSeats.length})
                  </p>
                  <p className="text-xs text-emerald-400">
                    ✓ Todos los check-in completados
                  </p>
                </div>
                <div className="space-y-4">
                  {state.allSeats.map((passenger, index) => (
                    <div 
                      key={index}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
                    >
                      {/* Origen y destino arriba del QR */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Origen</p>
                          <p className="text-base font-bold text-emerald-300">{state.vuelo?.origen?.codigo || '---'} - {state.vuelo?.origen?.ciudad || ''}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Destino</p>
                          <p className="text-base font-bold text-cyan-300">{state.vuelo?.destino?.codigo || '---'} - {state.vuelo?.destino?.ciudad || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <span className="text-emerald-300 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{passenger.nombre}</p>
                            {passenger.dni && (
                              <p className="text-slate-400 text-xs">DNI: {passenger.dni}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 rounded-xl px-4 py-2">
                          <p className="text-xs text-emerald-300 uppercase">Asiento</p>
                          <p className="text-xl font-bold text-white">{passenger.asiento}</p>
                        </div>
                      </div>
                      {/* QR individual para cada pasajero */}
                      <div className="flex justify-center pt-2 border-t border-slate-700/50">
                        <div className="flex flex-col items-center mt-3">
                          <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG 
                              value={generateBoardingPassUrl(passenger.nombre, passenger.dni, passenger.asiento, passenger.ticketId)} 
                              size={80} 
                              level="M" 
                              includeMargin={false} 
                              bgColor="#ffffff" 
                              fgColor="#0a1628" 
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Tarjeta de embarque</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-6 pt-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vuelo</p>
                    <p className="text-white font-medium">SW-{state.vuelo?.id || state.ticketId}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Vista para un solo pasajero */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pasajero</p>
                    <p className="text-xl font-bold text-white">{state.pasajero?.nombre || 'Pasajero'}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Documento</p>
                      <p className="text-white font-medium">{state.pasajero?.dni || '---'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vuelo</p>
                      <p className="text-white font-medium">SW-{state.vuelo?.id || state.ticketId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end">
                  <div className="text-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/50 rounded-2xl p-6">
                    <p className="text-xs text-emerald-300 uppercase tracking-wider mb-2">Tu Asiento</p>
                    <p className="text-5xl font-bold text-white mb-1">{state.asiento}</p>
                    <p className="text-xs text-slate-400">
                      {state.asiento.startsWith('A') && parseInt(state.asiento.slice(1)) <= 5 ? '✨ Primera Clase' : '🌿 Clase Económica'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#050816] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#050816] rounded-l-full"></div>
              <div className="border-t-2 border-dashed border-slate-600/50"></div>
            </div>

            {state.vuelo && (
              <div className="grid grid-cols-5 gap-4 items-center mb-6">
                <div className="col-span-2 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Origen</p>
                  <p className="text-3xl font-bold text-white mb-1">{state.vuelo.origen?.codigo || '---'}</p>
                  <p className="text-emerald-400 font-medium text-sm">{state.vuelo.origen?.ciudad || 'Ciudad'}</p>
                  <p className="text-slate-500 text-xs truncate" title={state.vuelo.origen?.aeropuerto}>{state.vuelo.origen?.aeropuerto || 'Aeropuerto'}</p>
                  <p className="text-cyan-300 font-mono text-lg mt-2">{formatTime(state.vuelo.salida)}</p>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="flex items-center w-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                    <div className="mx-2 text-3xl transform rotate-90 md:rotate-0">✈️</div>
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Vuelo directo</p>
                </div>

                <div className="col-span-2 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Destino</p>
                  <p className="text-3xl font-bold text-white mb-1">{state.vuelo.destino?.codigo || '---'}</p>
                  <p className="text-cyan-400 font-medium text-sm">{state.vuelo.destino?.ciudad || 'Ciudad'}</p>
                  <p className="text-slate-500 text-xs truncate" title={state.vuelo.destino?.aeropuerto}>{state.vuelo.destino?.aeropuerto || 'Aeropuerto'}</p>
                  <p className="text-cyan-300 font-mono text-lg mt-2">{formatTime(state.vuelo.llegada)}</p>
                </div>
              </div>
            )}

            {state.vuelo?.salida && (
              <div className="text-center bg-slate-800/50 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha de salida</p>
                <p className="text-emerald-300 font-medium capitalize">{formatDate(state.vuelo.salida)}</p>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG value={qrUrl} size={140} level="H" includeMargin={false} bgColor="#ffffff" fgColor="#0a1628" />
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">Escanea este código para ver tu tarjeta de embarque</p>
              <p className="text-center text-xs text-slate-600 mt-1">Ticket #{state.ticketId}</p>
            </div>
          </div>
        </div>

        <div className={`mb-8 ${cardClass}`} style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Recomendaciones para tu viaje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all hover:bg-slate-800/60 ${cardClass}`}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{rec.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8 ${cardClass}`} style={{ animationDelay: '1s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h4 className="text-amber-300 font-bold mb-2">Importante</h4>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• Tu tarjeta de embarque ha sido enviada a tu correo electrónico.</li>
                <li>• Puedes descargarla o mostrarla desde tu dispositivo móvil.</li>
                <li>• Si necesitas hacer cambios, contáctanos antes del vuelo.</li>
                <li>• Las puertas de embarque cierran 20 minutos antes de la salida.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row justify-center gap-4 ${cardClass}`} style={{ animationDelay: '1.1s' }}>
          <Link to="/perfil" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 rounded-xl font-bold text-center hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/30">
            Ver mis tickets
          </Link>
          <Link to="/" className="px-8 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl font-semibold text-center hover:bg-slate-700 transition-all">
            Volver al inicio
          </Link>
        </div>

        <div className={`mt-12 text-center ${cardClass}`} style={{ animationDelay: '1.3s' }}>
          <p className="text-slate-500 text-sm">
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:soporte@swokowsky.com" className="text-cyan-400 hover:underline">soporte@swokowsky.com</a>
          </p>
          <p className="text-slate-600 text-xs mt-2">© 2025 Swokowsky Airlines. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckinConfirmation;