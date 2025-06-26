// src/services/flightServices.ts
import api from '../../../api/axios';

// Tipos para las respuestas de la API
export interface Ciudad {
  id_ciudad: number;
  id_paisFK: number;
  id_gmtFK: number;
  nombre: string;
  codigo: string;
}

export interface FlightSearchRequest {
  originCityId: number;
  destinationCityId: number;
  departureDate: string;
  roundTrip: boolean;
  returnDate?: string;
  passengers: number;
  initialHour?: string;
  finalHour?: string;
  minimumPrice?: number;
  maximumPrice?: number;
}

export interface FlightSearchResponse {
  outboundFlights: any[];  // Vuelos de ida
  returnFlights?: any[];   // Vuelos de vuelta (opcional)
}

/**
 * Obtiene todas las ciudades disponibles desde la API
 */
export const fetchCiudades = async (): Promise<Ciudad[]> => {
  try {
    const response = await api.get<Ciudad[]>('/citys');
    return response.data;
  } catch (error) {
    console.error('Error al cargar ciudades:', error);
    throw new Error('No se pudieron cargar las ciudades. Por favor, intenta de nuevo.');
  }
};

/**
 * Busca vuelos de ida con filtros de horario
 */
export const searchOutboundFlights = async (
  searchParams: FlightSearchRequest
): Promise<any> => {
  try {
    const requestBody = {
      originCityId: searchParams.originCityId,
      destinationCityId: searchParams.destinationCityId,
      departureDate: searchParams.departureDate,
      roundTrip: false, // Solo ida para esta búsqueda
      returnDate: null,
      passengers: searchParams.passengers,
      initialHour: searchParams.initialHour || "00:00",
      finalHour: searchParams.finalHour || "23:59",
      minimumPrice: searchParams.minimumPrice || 0,
      maximumPrice: searchParams.maximumPrice || 999999999
    };

    const response = await api.post('/flights/search', requestBody);
    return response.data;
  } catch (error) {
    console.error('Error al buscar vuelos de ida:', error);
    throw new Error('No se pudieron buscar los vuelos de ida. Por favor, intenta de nuevo.');
  }
};

/**
 * Busca vuelos de vuelta con filtros de horario
 */
export const searchReturnFlights = async (
  searchParams: FlightSearchRequest
): Promise<any> => {
  try {
    const requestBody = {
      originCityId: searchParams.destinationCityId, // Invertido: destino es ahora origen
      destinationCityId: searchParams.originCityId, // Invertido: origen es ahora destino
      departureDate: searchParams.returnDate || searchParams.departureDate,
      roundTrip: false,
      returnDate: null,
      passengers: searchParams.passengers,
      initialHour: searchParams.initialHour || "00:00",
      finalHour: searchParams.finalHour || "23:59",
      minimumPrice: searchParams.minimumPrice || 0,
      maximumPrice: searchParams.maximumPrice || 999999999
    };

    const response = await api.post('/flights/search', requestBody);
    return response.data;
  } catch (error) {
    console.error('Error al buscar vuelos de vuelta:', error);
    throw new Error('No se pudieron buscar los vuelos de vuelta. Por favor, intenta de nuevo.');
  }
};

/**
 * Busca vuelos según los parámetros proporcionados
 * Si es ida y vuelta, hace dos llamadas separadas para aplicar filtros de horario independientes
 */
export const searchFlights = async (
  searchParams: FlightSearchRequest,
  returnHourFilters?: {
    initialHour?: string;
    finalHour?: string;
  }
): Promise<FlightSearchResponse> => {
  try {
    // Búsqueda de vuelos de ida
    const outboundFlights = await searchOutboundFlights(searchParams);

    // Si es ida y vuelta, buscar vuelos de regreso
    let returnFlights = null;
    if (searchParams.roundTrip && searchParams.returnDate) {
      const returnParams = {
        ...searchParams,
        initialHour: returnHourFilters?.initialHour || searchParams.initialHour,
        finalHour: returnHourFilters?.finalHour || searchParams.finalHour,
      };
      
      returnFlights = await searchReturnFlights(returnParams);
    }

    return {
      outboundFlights,
      returnFlights
    };
  } catch (error) {
    console.error('Error al buscar vuelos:', error);
    throw error;
  }
};