// src/services/flightServices.ts
import api from '@/api/axios';

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
 * Busca vuelos según los parámetros proporcionados
 * (Placeholder - implementar según tu API real)
 */
export const searchFlights = async (
  searchParams: FlightSearchRequest
): Promise<any> => {
  try {
    const response = await api.post('/flights/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error al buscar vuelos:', error);
    throw new Error('No se pudieron buscar los vuelos. Por favor, intenta de nuevo.');
  }
};