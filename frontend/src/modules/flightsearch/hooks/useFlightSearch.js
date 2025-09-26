// src/hooks/useFlightSearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { FlightService } from '../services/flightService';

const generateFlightId = (flight = {}, idx = 0) => {
  const from = flight.origen?.codigo_iata || flight.origen?.ciudad || 'FROM';
  const to = flight.destino?.codigo_iata || flight.destino?.ciudad || 'TO';
  const date = flight.fecha_salida_programada || flight.fecha_salida || 'DATE';
  const time = flight.hora_salida_utc || flight.hora_salida || 'TIME';
  return `${from}-${to}-${date}-${time}-${idx}`;
};

const normalizeApiResponse = (data = {}) => {
  // Si la API viene con axios (data.data) ya fue extraído en el hook, aquí asumimos data "puro"
  if (!data) return { type: 'oneway', outbound: [], inbound: [], metadata: {} };

  if (data.type === 'roundtrip') {
    const outbound = Array.isArray(data.outbound) ? data.outbound : [];
    const inbound = Array.isArray(data.inbound) ? data.inbound : [];
    return {
      type: 'roundtrip',
      outbound: outbound.map((f, i) => ({ id: f.id ?? generateFlightId(f, i), ...f })),
      inbound: inbound.map((f, i) => ({ id: f.id ?? generateFlightId(f, i), ...f })),
      metadata: data.metadata ?? {},
    };
  }

  // Caso común oneway: API usa `results`
  if (data.type === 'oneway' || Array.isArray(data.results)) {
    const arr = Array.isArray(data.results) ? data.results : (data.outbound || []);
    return {
      type: 'oneway',
      outbound: arr.map((f, i) => ({ id: f.id ?? generateFlightId(f, i), ...f })),
      inbound: [],
      metadata: data.metadata ?? {},
    };
  }

  // fallback
  return { type: 'oneway', outbound: [], inbound: [], metadata: {} };
};

export const useFlightSearch = (searchCriteria, options = {}) => {
  const { skip = false } = options;

  const [results, setResults] = useState({
    type: 'oneway',
    outbound: [],
    inbound: [],
    metadata: {}
  });
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const latestCriteriaRef = useRef(searchCriteria);

  useEffect(() => {
    latestCriteriaRef.current = searchCriteria;
  }, [searchCriteria]);

  const fetchFlightsNow = useCallback(async (criteria) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setError(null);

    try {
      const rawResponse = await FlightService.searchFlights(criteria, { signal });

      // Manejo: si FlightService devuelve un AxiosResponse, extraemos .data
      const payload = rawResponse && rawResponse.data ? rawResponse.data : rawResponse;

      // Loguea la respuesta cruda (mira la consola del navegador)
      console.debug('[useFlightSearch] payload recibido:', payload);

      if (signal.aborted) return;

      const normalized = normalizeApiResponse(payload);
      console.debug('[useFlightSearch] payload normalizado:', normalized);

      setResults(normalized);
    } catch (err) {
      if (signal.aborted) return;

      // Si es un error de axios, muestra más info
      console.error('[useFlightSearch] error buscando vuelos:', err);
      setError(err?.message || (err?.toString ? err.toString() : 'Error al buscar vuelos'));
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
