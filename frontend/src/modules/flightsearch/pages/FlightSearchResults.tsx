import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useFlightSearch } from '../hooks/useFlightSearch';
import { FlightCard } from '../components/FlightCard';
import { LoadingState, ErrorState, NoFlightsFound } from '../components/EmptyStates';
import type { Flight } from '../types/Flight';
import { toCardFlight } from '../types/Flight';

export function FlightSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchCriteria = useMemo(() => ({
    originCityId: parseInt(searchParams.get('originId') || '0', 10) || null,
    destinationCityId: parseInt(searchParams.get('destinationId') || '0', 10) || null,
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || null,
    passengers: parseInt(searchParams.get('passengers') || '1', 10),
    roundTrip: searchParams.get('roundTrip') === 'true',
  }), [searchParams]);

  const showDebug = searchParams.get('debug') === 'true';

  const displayNames = {
    origen: searchParams.get('origen') || 'Origen desconocido',
    destino: searchParams.get('destino') || 'Destino desconocido',
  };

  const { results, loading, error, refetch } = useFlightSearch(searchCriteria);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Normaliza todos los vuelos para asegurar que idVuelo siempre sea el id del backend
  const outboundFlights: Flight[] = (results?.outbound || []).map(toCardFlight);
  const inboundFlights: Flight[] = (results?.inbound || []).map(toCardFlight);

  // Navegación a detalles de vuelo
  const handleSelectFlight = (flight: Flight) => {
    // Usa siempre el id del backend (id_vuelo) como idVuelo
    const flightId = flight.idVuelo;
    if (!flightId || typeof flightId !== 'number') {
      alert('Error: El vuelo seleccionado no tiene un ID válido del backend.');
      return;
    }
    const params = new URLSearchParams({
      originCityId: searchParams.get('originId') || '',
      destinationCityId: searchParams.get('destinationId') || '',
      departureDate: searchParams.get('departureDate') || '',
      returnDate: searchParams.get('returnDate') || '',
      roundTrip: searchParams.get('roundTrip') || '',
      passengers: searchParams.get('passengers') || ''
    });
    navigate(`/detalle-vuelo/${flightId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8]">
      {/* Botón de regresar moderno */}
      <div className="pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 text-white font-semibold transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-lg">Regresar</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header moderno */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
            Vuelos de {displayNames.origen} a {displayNames.destino}
          </h1>
          <p className="text-white/80 text-lg">Mostrando resultados para tu búsqueda.</p>
        </div>

        {showDebug && (
          <details className="mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            <summary className="cursor-pointer font-medium text-white">Debug: ver objeto <code>results</code></summary>
            <pre className="mt-2 text-sm whitespace-pre-wrap text-white/80">{JSON.stringify(results, null, 2)}</pre>
          </details>
        )}

        <div className="space-y-8">
        {/* Vuelos de Ida */}
        {outboundFlights.length > 0 ? (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Vuelos de Ida</h2>
            </div>
            <div className="space-y-4">
              {outboundFlights.map((flight) => (
                <FlightCard
                  key={flight.idVuelo}
                  flight={flight}
                  onSelectFlight={handleSelectFlight}
                />
              ))}
            </div>
          </section>
        ) : (
          <NoFlightsFound />
        )}

        {/* Vuelos de Regreso */}
        {inboundFlights.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#39A5D8] to-[#0F6899] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Vuelos de Regreso</h2>
            </div>
            <div className="space-y-4">
              {inboundFlights.map((flight) => (
                <FlightCard
                  key={flight.idVuelo}
                  flight={flight}
                  onSelectFlight={handleSelectFlight}
                />
              ))}
            </div>
          </section>
        )}

        
      </div>
      </main>
    </div>
  );
}