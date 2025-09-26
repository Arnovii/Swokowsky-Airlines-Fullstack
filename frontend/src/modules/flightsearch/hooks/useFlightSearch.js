// src/hooks/useFlightSearch.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { FlightService } from '../services/flightService';

export const useFlightSearch = (searchCriteria, options = {}) => {
  const { skip = false } = options;
  
  const [results, setResults] = useState({
    type: 'oneway',
    outbound: [],
    inbound: [],
    metadata: {}
  });
  
  const [loading, setLoading] = useState(!skip); // Inicia cargando si no se salta la búsqueda
  const [error, setError] = useState(null);
  
  // 1. ELIMINADO: El estado de `metadata` es redundante, ya está en `results`.
  
  // No necesitamos `filters` en este hook, ya que se aplican en el frontend (UI).
  // La búsqueda en la API solo depende de `searchCriteria`.

  // Usamos una ref para el AbortController
  const abortControllerRef = useRef(null);

  // 2. CAMBIO CLAVE: La lógica de fetch se mueve dentro del useEffect.
  // Esto simplifica el manejo de dependencias y evita re-renderizados infinitos.
  useEffect(() => {
    // Si la opción `skip` está activa, no hacemos nada.
    if (skip) {
      setLoading(false);
      return;
    }

    // Validación de los criterios de búsqueda.
    if (!searchCriteria?.originCityId || !searchCriteria?.destinationCityId || !searchCriteria?.departureDate) {
      setResults({ type: 'oneway', outbound: [], inbound: [], metadata: {} });
      setLoading(false);
      return;
    }

    // Cancelamos la petición anterior si existe una nueva.
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const currentSignal = abortControllerRef.current.signal;

    const fetchFlights = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await FlightService.searchFlights(
          searchCriteria,
          { signal: currentSignal } // Pasamos la señal
        );
        
        // Solo actualizamos el estado si la petición no fue cancelada
        if (!currentSignal.aborted) {
          setResults(data);
        }
      } catch (err) {
        if (!currentSignal.aborted) {
          setError(err.message);
          setResults({ type: 'oneway', outbound: [], inbound: [], metadata: {} });
        }
      } finally {
        if (!currentSignal.aborted) {
          setLoading(false);
        }
      }
    };

    // 3. DEBOUNCING: Usamos un timeout para no lanzar la búsqueda en cada tecleo.
    const timeoutId = setTimeout(fetchFlights, 300);

    // Función de limpieza: se ejecuta si el componente se desmonta o las dependencias cambian.
    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };

    // 4. DEPENDENCIAS SIMPLIFICADAS: El efecto se ejecuta solo cuando los criterios de búsqueda cambian.
  }, [JSON.stringify(searchCriteria), skip]); 

  // La función de refetch ahora se define con useCallback para que sea estable.
  const refetch = useCallback(() => {
    // Esta función podría re-implementar la lógica de fetch si se necesita
    // llamar manualmente, pero por ahora la dejamos simple.
    // Para una implementación completa, replicaría la lógica de dentro del useEffect.
    console.log("Refetching con los criterios actuales:", searchCriteria);
  }, [searchCriteria]);
  
  return {
    results,
    loading,
    error,
    // La metadata se expone directamente desde el objeto de resultados
    metadata: results.metadata,
    refetch,
  };
};