import React, { useMemo, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { FlightCard } from '../components/FlightCard';
import { LoadingState, ErrorState, NoFlightsFound } from '../components/EmptyStates';
import { ClassSelectorModal } from '../components/ClassSelectorModal';
import type { Flight } from '../types/Flight';
import { toCardFlight } from '../types/Flight';


export function FlightSearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Estado para el modal y vuelo seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

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
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const outboundFlights: Flight[] = (results?.outbound || []).map(toCardFlight);
  const inboundFlights: Flight[] = (results?.inbound || []).map(toCardFlight);

  // Abrir modal al hacer clic en agregar al carrito
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  // Agregar al carrito con la clase seleccionada
  const handleClassSelection = async (clase: 'economica' | 'primera_clase') => {
    if (!selectedFlight) return;
    
    try {
      await addToCart({
        id_vueloFK: selectedFlight.idVuelo,
        cantidad_de_tickets: searchCriteria.passengers,
        clase: clase,
      });
      navigate('/carrito');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8]">
      {/* Modal de selección de clase */}
      <ClassSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectClass={handleClassSelection}
        flightInfo={selectedFlight ? {
          origen: selectedFlight.origen?.ciudad || '',
          destino: selectedFlight.destino?.ciudad || '',
          precio: selectedFlight.price || 0,
        } : undefined}
      />

      {/* Botón de regresar responsive */}
      <div className="pt-4 sm:pt-6 md:pt-8 px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/30 text-white font-semibold transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-base sm:text-lg">Regresar</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-full mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2 px-2">
            Vuelos de {displayNames.origen} a {displayNames.destino}
          </h1>
          <p className="text-white/80 text-sm sm:text-base md:text-lg px-2">
            Mostrando resultados para {searchCriteria.passengers} pasajero{searchCriteria.passengers > 1 ? 's' : ''}
          </p>
        </div>

        {showDebug && (
          <details className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/20">
            <summary className="cursor-pointer font-medium text-white text-sm sm:text-base">
              Debug: ver objeto <code>results</code>
            </summary>
            <pre className="mt-2 text-xs sm:text-sm whitespace-pre-wrap text-white/80 overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        )}

        <div className="space-y-6 sm:space-y-8">
          {/* Vuelos de Ida */}
          {outboundFlights.length > 0 ? (
            <section>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Vuelos de Ida</h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
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
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-[#39A5D8] to-[#0F6899] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Vuelos de Regreso</h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
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