// Página de tarjeta de embarque - accesible via QR
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

interface BoardingPassData {
  ticketId: string;
  pasajero: string;
  dni: string;
  asiento: string;
  vuelo: string;
  origenCodigo: string;
  origenCiudad: string;
  origenAeropuerto: string;
  destinoCodigo: string;
  destinoCiudad: string;
  destinoAeropuerto: string;
  salida: string;
  llegada: string;
  codigoReserva: string;
}

const BoardingPass: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<BoardingPassData | null>(null);

  useEffect(() => {
    // Extraer datos de los query parameters
    const ticketId = searchParams.get('ticketId') || '';
    const pasajero = searchParams.get('pasajero') || '';
    const dni = searchParams.get('dni') || '';
    const asiento = searchParams.get('asiento') || '';
    const vuelo = searchParams.get('vuelo') || '';
    const origenCodigo = searchParams.get('origenCodigo') || '';
    const origenCiudad = searchParams.get('origenCiudad') || '';
    const origenAeropuerto = searchParams.get('origenAeropuerto') || '';
    const destinoCodigo = searchParams.get('destinoCodigo') || '';
    const destinoCiudad = searchParams.get('destinoCiudad') || '';
    const destinoAeropuerto = searchParams.get('destinoAeropuerto') || '';
    const salida = searchParams.get('salida') || '';
    const llegada = searchParams.get('llegada') || '';
    const codigoReserva = searchParams.get('codigoReserva') || '';

    if (ticketId && pasajero) {
      setData({
        ticketId,
        pasajero,
        dni,
        asiento,
        vuelo,
        origenCodigo,
        origenCiudad,
        origenAeropuerto,
        destinoCodigo,
        destinoCiudad,
        destinoAeropuerto,
        salida,
        llegada,
        codigoReserva,
      });
    }
  }, [searchParams]);

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

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0a1628] to-[#020617] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Tarjeta de embarque no válida</h1>
          <p className="text-slate-400 mb-6">No se encontraron los datos de la tarjeta de embarque.</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-cyan-500 text-slate-900 rounded-xl font-semibold hover:bg-cyan-400 transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0a1628] to-[#020617] text-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full mb-4 shadow-lg shadow-emerald-500/30">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tarjeta de Embarque</h1>
          <p className="text-slate-400 text-sm">Swokowsky Airlines</p>
        </div>

        {/* Boarding Pass Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          {/* Header de la tarjeta */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">✈️</span>
                </div>
                <div>
                  <h2 className="text-white font-bold">Swokowsky Airlines</h2>
                  <p className="text-emerald-100 text-xs">Boarding Pass</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-xs">Reserva</p>
                <p className="text-white font-mono font-bold tracking-wider">
                  {data.codigoReserva.toUpperCase() || `#${data.ticketId}`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Pasajero */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pasajero</p>
              <p className="text-xl font-bold text-white">{data.pasajero}</p>
              {data.dni && <p className="text-slate-400 text-sm">DNI: {data.dni}</p>}
            </div>

            {/* Ruta con ciudades */}
            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2 text-center">
                <p className="text-xs text-slate-400 uppercase">Origen</p>
                <p className="text-3xl font-bold text-white mb-1">{data.origenCodigo}</p>
                <p className="text-emerald-400 text-xs font-medium">{data.origenCiudad}</p>
                {data.origenAeropuerto && (
                  <p className="text-slate-500 text-xs mt-1">{data.origenAeropuerto}</p>
                )}
              </div>
              <div className="col-span-1 flex justify-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div className="w-8 h-px bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                  <span className="text-lg">✈️</span>
                  <div className="w-8 h-px bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs text-slate-400 uppercase">Destino</p>
                <p className="text-3xl font-bold text-white mb-1">{data.destinoCodigo}</p>
                <p className="text-cyan-400 text-xs font-medium">{data.destinoCiudad}</p>
                {data.destinoAeropuerto && (
                  <p className="text-slate-500 text-xs mt-1">{data.destinoAeropuerto}</p>
                )}
              </div>
            </div>

            {/* Línea punteada */}
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#050816] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#050816] rounded-l-full"></div>
              <div className="border-t-2 border-dashed border-slate-600/50"></div>
            </div>

            {/* Info del vuelo y asiento */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase">Vuelo</p>
                <p className="text-lg font-bold text-white">SW-{data.vuelo}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase">Salida</p>
                <p className="text-lg font-bold text-cyan-300">{formatTime(data.salida)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase">Asiento</p>
                <p className="text-2xl font-bold text-emerald-400">{data.asiento}</p>
              </div>
            </div>

            {/* Fecha */}
            {data.salida && (
              <div className="text-center bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 uppercase mb-1">Fecha de salida</p>
                <p className="text-emerald-300 font-medium text-sm capitalize">{formatDate(data.salida)}</p>
              </div>
            )}

            {/* QR pequeño para verificación */}
            <div className="flex justify-center pt-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG 
                  value={window.location.href} 
                  size={100} 
                  level="M" 
                  includeMargin={false} 
                  bgColor="#ffffff" 
                  fgColor="#0a1628" 
                />
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">Ticket #{data.ticketId}</p>
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-amber-300 font-semibold text-sm mb-1">Importante</p>
              <p className="text-slate-400 text-xs">
                Presenta esta tarjeta de embarque en el counter del aeropuerto junto con tu documento de identidad.
                Las puertas cierran 20 minutos antes de la salida.
              </p>
            </div>
          </div>
        </div>

        {/* Botón inicio */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BoardingPass;