// src/pages/FlightSearchResults.jsx

import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// 1. Importamos el hook y los componentes de UI
import { useFlightSearch } from '../hooks/useFlightSearch';
import { FlightCard } from '../components/FlightCard';
import { LoadingState, ErrorState, NoFlightsFound } from '../components/EmptyStates';

export function FlightSearchResults() {
  const [searchParams] = useSearchParams();

  // 2. Creamos el objeto `searchCriteria` a partir de la URL
  // Usamos useMemo para que no se recalcule en cada render
  const searchCriteria = useMemo(() => ({
    originCityId: parseInt(searchParams.get('originId'), 10) || null,
    destinationCityId: parseInt(searchParams.get('destinationId'), 10) || null,
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || null,
    passengers: parseInt(searchParams.get('passengers'), 10) || 1,
    roundTrip: searchParams.get('roundTrip') === 'true',
  }), [searchParams]);

  // También obtenemos los nombres para mostrarlos en la UI
  const displayNames = {
    origen: searchParams.get('origen') || 'Origen desconocido',
    destino: searchParams.get('destino') || 'Destino desconocido',
  };

  // 3. ¡Usamos nuestro hook! Le pasamos los criterios de la URL
  const { results, loading, error, refetch } = useFlightSearch(searchCriteria);

  // 4. Renderizamos la UI según el estado del hook
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const hasOutboundFlights = results.outbound && results.outbound.length > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Vuelos de {displayNames.origen} a {displayNames.destino}
      </h1>
      <p className="text-gray-600 mb-8">
        Mostrando resultados para tu búsqueda.
      </p>

      {!hasOutboundFlights ? (
        <NoFlightsFound />
      ) : (
        <div className="space-y-8">
          {/* Vuelos de Ida */}
          <section>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Vuelos de Ida</h2>
            <div className="space-y-4">
              {results.outbound.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </section>

          {/* Vuelos de Vuelta (si aplica) */}
          {results.type === 'roundtrip' && results.inbound.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Vuelos de Vuelta</h2>
              <div className="space-y-4">
                {results.inbound.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}