import { useState, useEffect, useCallback, useRef } from 'react';

export const useFlightSearch = (searchCriteria) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [filters, setFilters] = useState({
    precio: { min: 0, max: 0 },
    horaSalida: [],
    clase: [],
    soloPromociones: false
  });

  // Referencia para evitar llamadas duplicadas
  const abortControllerRef = useRef(null);
  const lastSearchRef = useRef('');

  const fetchFlights = useCallback(async () => {
    // Validar criterios mínimos
    if (!searchCriteria?.origen || !searchCriteria?.destino || !searchCriteria?.fecha) {
      console.log('❌ Criterios insuficientes:', searchCriteria);
      setFlights([]);
      setLoading(false);
      return;
    }

    // Crear clave única para esta búsqueda
    const searchKey = JSON.stringify({
      ...searchCriteria,
      filters
    });

    // Evitar búsquedas duplicadas
    if (searchKey === lastSearchRef.current) {
      console.log('🔄 Búsqueda duplicada, saltando...');
      return;
    }

    // Cancelar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador de cancelación
    abortControllerRef.current = new AbortController();
    lastSearchRef.current = searchKey;

    console.log('🚀 Iniciando nueva búsqueda:', searchCriteria);
    
    setLoading(true);
    setError(null);

    try {
      // Simular delay y datos para debugging
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría tu llamada real a la API
      // const data = await FlightService.searchFlights(searchCriteria, filters);
      
      // Datos mock para debugging
      const mockData = {
        flights: [],
        total: 0,
        metadata: { searchTime: '150ms' }
      };

      if (!abortControllerRef.current?.signal.aborted) {
        setFlights(mockData.flights);
        setMetadata(mockData.metadata);
        console.log('✅ Búsqueda completada');
      }

    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('❌ Error en búsqueda:', err);
        setError(err.message);
        setFlights([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    // Dependencias específicas, no objetos completos
    searchCriteria?.origen,
    searchCriteria?.destino,
    searchCriteria?.fecha,
    searchCriteria?.fechaVuelta,
    searchCriteria?.pasajeros,
    searchCriteria?.adultos,
    searchCriteria?.menores,
    searchCriteria?.modo,
    filters?.precio?.min,
    filters?.precio?.max,
    JSON.stringify(filters?.horaSalida), // Para arrays
    JSON.stringify(filters?.clase),
    filters?.soloPromociones
  ]);

  // Effect principal
  useEffect(() => {
    console.log('🔄 useEffect disparado por cambio en criterios/filtros');
    
    // Delay para evitar llamadas múltiples rápidas
    const timeoutId = setTimeout(() => {
      fetchFlights();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchFlights]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    flights,
    loading,
    error,
    metadata,
    filters,
    setFilters,
    refetch: fetchFlights
  };
};
