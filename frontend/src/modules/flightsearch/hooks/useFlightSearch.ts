import { useState, useEffect, useCallback, useRef } from 'react';
import { FlightService } from '../services/flightService';

export interface FlightSearchResult {
  id: string | number;
  id_vuelo?: number;
  [key: string]: any;
}

export interface FlightSearchNormalized {
  type: 'oneway' | 'roundtrip';
  outbound: FlightSearchResult[];
  inbound: FlightSearchResult[];
  metadata: Record<string, any>;
}

const generateFlightId = (flight: any = {}, idx: number = 0): string => {
  const from = flight.origen?.codigo_iata || flight.origen?.ciudad || 'FROM';
  const to = flight.destino?.codigo_iata || flight.destino?.ciudad || 'TO';
  const date = flight.fecha_salida_programada || flight.fecha_salida || 'DATE';
  const time = flight.hora_salida_utc || flight.hora_salida || 'TIME';
  return `${from}-${to}-${date}-${time}-${idx}`;
};

const normalizeApiResponse = (data: any = {}): FlightSearchNormalized => {
  // Si la API viene con axios (data.data) ya fue extraído en el hook, aquí asumimos data "puro"
  if (!data) return { type: 'oneway', outbound: [], inbound: [], metadata: {} };

  if (data.type === 'roundtrip') {
    const outbound = Array.isArray(data.outbound) ? data.outbound : [];
    const inbound = Array.isArray(data.inbound) ? data.inbound : [];
      return {
        type: 'roundtrip',
        outbound: outbound.map((f: FlightSearchResult, i: number) => ({ ...f, id: f.id_vuelo || f.id || generateFlightId(f, i), id_vuelo: f.id_vuelo })),
        inbound: inbound.map((f: FlightSearchResult, i: number) => ({ ...f, id: f.id_vuelo || f.id || generateFlightId(f, i), id_vuelo: f.id_vuelo })),
        metadata: data.metadata ?? {},
      };
  }

  // Caso común oneway: API usa `results`
  if (data.type === 'oneway' || Array.isArray(data.results)) {
    const arr = Array.isArray(data.results) ? data.results : (data.outbound || []);
    return {
      type: 'oneway',
      outbound: arr.map((f: FlightSearchResult, i: number) => ({ ...f, id: f.id_vuelo || f.id || generateFlightId(f, i), id_vuelo: f.id_vuelo })),
      inbound: [],
      metadata: data.metadata ?? {},
    };
  }

  // fallback
  return { type: 'oneway', outbound: [], inbound: [], metadata: {} };
};

interface UseFlightSearchOptions {
  skip?: boolean;
}

export const useFlightSearch = (
  searchCriteria: Record<string, any>,
  options: UseFlightSearchOptions = {}
): {
  results: FlightSearchNormalized;
  loading: boolean;
  error: string | null;
  metadata: Record<string, any>;
  refetch: () => void;
} => {
  const { skip = false } = options;

  const [results, setResults] = useState<FlightSearchNormalized>({
    type: 'oneway',
    outbound: [],
    inbound: [],
    metadata: {}
  });
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const latestCriteriaRef = useRef<Record<string, any>>(searchCriteria);

  useEffect(() => {
    latestCriteriaRef.current = searchCriteria;
  }, [searchCriteria]);

  const fetchFlightsNow = useCallback(async (criteria: Record<string, any>) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setError(null);

    try {
     
      const searchParams: Record<string, any> = {
        originCityId: criteria.originCityId,
        destinationCityId: criteria.destinationCityId,
        departureDate: criteria.departureDate,
        passengers: criteria.passengers,
        roundTrip: criteria.roundTrip,
      };

      // Agregar fecha de retorno si existe
      if (criteria.returnDate) {
        searchParams.returnDate = criteria.returnDate;
      }

      // NUEVO: Agregar filtros de precio
      if (criteria.minimumPrice) {
        searchParams.minimumPrice = Number(criteria.minimumPrice);
      }
      if (criteria.maximumPrice) {
        searchParams.maximumPrice = Number(criteria.maximumPrice);
      }

      if (criteria.outboundFinalHour) {
        searchParams.finalHour = criteria.outboundFinalHour;
      }
      if (criteria.outboundInitialHour) {
        // La API espera "initialHour" (string de hora, ej: "06:00")
        searchParams.initialHour = criteria.outboundInitialHour; 
      }
      
      // Agrega la hora final general (usando el valor de outboundFinalHour)
      if (criteria.outboundFinalHour) {
        // La API espera "finalHour" (string de hora, ej: "16:00")
        searchParams.finalHour = criteria.outboundFinalHour;
      }

      console.log('[useFlightSearch] Enviando búsqueda con filtros:', searchParams);

      const payload = await FlightService.searchFlights(searchParams, { signal });

      // Loguea la respuesta cruda (mira la consola del navegador)
      console.debug('[useFlightSearch] payload recibido:', payload);

      if (signal.aborted) return;

      const normalized = normalizeApiResponse(payload);
      console.debug('[useFlightSearch] payload normalizado:', normalized);

      setResults(normalized);
    } catch (err: unknown) {
      if (signal.aborted) return;

      // Si es un error de axios, muestra más info
      console.error('[useFlightSearch] error buscando vuelos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar vuelos';
      setError(errorMessage);
      setResults({ type: 'oneway', outbound: [], inbound: [], metadata: {} });
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }

    if (!searchCriteria?.originCityId || !searchCriteria?.destinationCityId || !searchCriteria?.departureDate) {
      setResults({ type: 'oneway', outbound: [], inbound: [], metadata: {} });
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => fetchFlightsNow(searchCriteria), 300);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [JSON.stringify(searchCriteria), skip, fetchFlightsNow]);

  const refetch = useCallback(() => {
    if (!latestCriteriaRef.current) return;
    fetchFlightsNow(latestCriteriaRef.current);
  }, [fetchFlightsNow]);

  return {
    results,
    loading,
    error,
    metadata: results.metadata,
    refetch,
  };
};