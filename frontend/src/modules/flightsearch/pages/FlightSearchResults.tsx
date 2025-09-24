
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, MapPin } from 'lucide-react';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { FlightUtils } from '../utils/flightUtils';
import { FLIGHT_CONSTANTS } from '../constants/flightConstants';
import { SearchFiltersSidebar } from '../components/SearchFiltersSidebar';
import { FlightCard } from '../components/FlightCard';
import { NoFlightsFound, ErrorState, LoadingState } from '../components/EmptyStates';

const FlightSearchResults = () => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('precio');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Obtener criterios de búsqueda de la URL
  const searchCriteria = {
    origen: searchParams.get('origen') || '',
    destino: searchParams.get('destino') || '',
    fecha: searchParams.get('fecha') || '',
    fechaVuelta: searchParams.get('fechaVuelta') || '',
    pasajeros: parseInt(searchParams.get('pasajeros')) || 1,
    adultos: parseInt(searchParams.get('adultos')) || 1,
    menores: parseInt(searchParams.get('menores')) || 0,
    modo: searchParams.get('modo') || 'ida_vuelta'
  };

  // Hook personalizado para manejar la búsqueda
  const { 
    flights, 
    loading, 
    error, 
    metadata, 
    filters, 
    setFilters, 
    refetch 
  } = useFlightSearch(searchCriteria);

  // Ordenar vuelos
  const sortedFlights = FlightUtils.sortFlights(flights, sortBy);

  // Handlers
  const handleFlightSelect = (flight) => {
    console.log('Vuelo seleccionado:', flight);
    // Aquí puedes navegar a la página de detalles o abrir un modal
    // navigate(`/flight/${flight.id_vuelo}`);
  };

  const handleClearFilters = () => {
    setFilters({
      precio: { min: 0, max: 0 },
      horaSalida: [],
      clase: [],
      soloPromociones: false
    });
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-white/20 shadow-lg">
                <div className="h-6 bg-gray-200 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <LoadingState />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con criterios de búsqueda */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-sans">
            <div className="p-1 bg-blue-50 rounded">
              <MapPin size={16} className="text-blue-600" />
            </div>
            <span className="font-bold">{searchCriteria.origen} → {searchCriteria.destino}</span>
            {searchCriteria.fecha && (
              <>
                <span>•</span>
                <span>{new Date(`${searchCriteria.fecha}T00:00:00`).toLocaleDateString('es-CO')}</span>
              </>
            )}
            {searchCriteria.fechaVuelta && (
              <>
                <span>•</span>
                <span>{new Date(`${searchCriteria.fechaVuelta}T00:00:00`).toLocaleDateString('es-CO')}</span>
              </>
            )}
            <span>•</span>
            <span>{searchCriteria.pasajeros} pasajero{searchCriteria.pasajeros > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{searchCriteria.modo === 'ida_vuelta' ? 'Ida y vuelta' : 'Solo ida'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#081225] mb-2 font-sans">
                Resultados de búsqueda
              </h1>
              {metadata.total && (
                <p className="text-gray-600 font-sans">
                  {metadata.total} vuelos encontrados • Búsqueda realizada en {metadata.searchTime}ms
                </p>
              )}
            </div>
            
            {/* Controles móviles */}
            <div className="flex items-center gap-4 sm:hidden">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors font-sans font-medium shadow-sm"
              >
                <Filter size={16} />
                Filtros
                {FlightUtils.getActiveFiltersCount(filters) > 0 && (
                  <span className="ml-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    {FlightUtils.getActiveFiltersCount(filters)}
                  </span>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-sans shadow-sm"
              >
                {FLIGHT_CONSTANTS.SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <SearchFiltersSidebar 
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {/* Header de resultados - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium font-sans">
                  {sortedFlights.length} vuelos encontrados
                </span>
                {FlightUtils.getActiveFiltersCount(filters) > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    {FlightUtils.getActiveFiltersCount(filters)} filtros activos
                  </span>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-sans"
              >
                {FLIGHT_CONSTANTS.SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de vuelos o estado vacío */}
            {sortedFlights.length > 0 ? (
              <div className="space-y-6">
                {sortedFlights.map((flight) => (
                  <FlightCard 
                    key={flight.id_vuelo} 
                    flight={flight} 
                    onSelectFlight={handleFlightSelect}
                  />
                ))}
              </div>
            ) : (
              <NoFlightsFound onClearFilters={handleClearFilters} />
            )}
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main>
      <h1>Búsqueda de Vuelos</h1>
      {/* Tu JSX aquí */}
    </main>
  );
};

export default FlightSearchResults;

