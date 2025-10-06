import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { useFlightSearch } from '../hooks/useFlightSearch';
import { FlightCard } from '../components/FlightCard';
import { LoadingState, ErrorState, NoFlightsFound } from '../components/EmptyStates';

export function FlightSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchCriteria = useMemo(() => ({
    originCityId: parseInt(searchParams.get('originId'), 10) || null,
    destinationCityId: parseInt(searchParams.get('destinationId'), 10) || null,
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || null,
    passengers: parseInt(searchParams.get('passengers'), 10) || 1,
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

  const outboundFlights = results?.outbound || [];
  const inboundFlights = results?.inbound || [];

  // Navegación a detalles de vuelo
  const handleSelectFlight = (flight) => {
    navigate(`/detalle-vuelo/${flight.id}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Vuelos de {displayNames.origen} a {displayNames.destino}
      </h1>
      <p className="text-gray-600 mb-8">Mostrando resultados para tu búsqueda.</p>

      {showDebug && (
        <details className="mb-6 p-4 bg-gray-50 rounded">
          <summary className="cursor-pointer font-medium">Debug: ver objeto <code>results</code></summary>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
        </details>
      )}

      <div className="space-y-8">
        {/* Vuelos de Ida */}
        {outboundFlights.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Vuelos de Ida</h2>
            <div className="space-y-4">
              {outboundFlights.map((flight) => (
                <FlightCard
                  key={flight.id ?? `${flight.origen?.codigo_iata}-${flight.destino?.codigo_iata}-${flight.fecha_salida_programada}`}
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
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Vuelos de Regreso</h2>
            <div className="space-y-4">
              {inboundFlights.map((flight) => (
                <FlightCard
                  key={flight.id ?? `${flight.origen?.codigo_iata}-${flight.destino?.codigo_iata}-${flight.fecha_salida_programada}`}
                  flight={flight}
                  onSelectFlight={handleSelectFlight}
                />
              ))}
            </div>
          </section>
        )}

        {/* Vuelos de Vuelta */}
        {results?.type === 'roundtrip' && inboundFlights.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Vuelos de Vuelta</h2>
            <div className="space-y-4">
              {inboundFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} onSelectFlight={handleSelectFlight} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}