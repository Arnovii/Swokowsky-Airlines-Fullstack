// src/services/flightService.js

import api from '@/api/axios'; // Asegúrate que la ruta a tu instancia de axios sea correcta

// La función de normalización que arregla todos los problemas de datos
function normalizeFlightData(flight) {
  const departureDate = new Date(`${flight.fecha_salida_programada}T${flight.hora_salida_utc}:00Z`);
  const arrivalDate = new Date(`${flight.fecha_llegada_programada}T${flight.hora_llegada_utc}:00Z`);

  let durationInMinutes = 0;
  if (!isNaN(departureDate) && !isNaN(arrivalDate)) {
    durationInMinutes = (arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60);
  }

  const isInternational = (flight.origen?.pais || '') !== (flight.destino?.pais || '');

  return {
    id: flight.id_vuelo || `${flight.origen?.codigo_iata}-${flight.hora_salida_utc}`,
    price: flight.precio_economica || flight.precio_base || 0,
    priceFirstClass: flight.precio_primera_clase || 0,
    departureTimeUTC: `${flight.fecha_salida_programada || ''}T${flight.hora_salida_utc || ''}:00Z`,
    arrivalTimeUTC: `${flight.fecha_llegada_programada || ''}T${flight.hora_llegada_utc || ''}:00Z`,
    durationMinutes: durationInMinutes,
    availableSeats: flight.available_seats || 0,
    origin: flight.origen,
    destination: flight.destino,
    aircraftModel: flight.modelo_aeronave || "No especificado",
    isInternational: isInternational,
    availableClasses: flight.clases_disponibles || [],
    promotion: flight.promocion ? {
      name: flight.promocion.nombre || '',
      discount: flight.promocion.descuento || 0,
      remainingSeats: flight.promocion.cupoRestante || 0,
    } : null,
  };
}


export class FlightService {
  /**
   * Busca vuelos y devuelve los datos ya normalizados.
   */
  static async searchFlights(searchCriteria, options = {}) {
    try {
      const response = await api.post('/flights/search', searchCriteria, {
        signal: options.signal,
      });

      const data = response.data;

      // Paso clave: Mapeamos sobre las listas 'outbound' e 'inbound'
      const outboundFlights = (data.outbound || []).map(normalizeFlightData);
      const inboundFlights = (data.inbound || []).map(normalizeFlightData);

      // Devolvemos el objeto con las listas ya normalizadas.
      return {
        type: data.type,
        outbound: outboundFlights,
        inbound: inboundFlights,
        metadata: data.metadata || {},
      };

    } catch (error) {
      if (error.name === 'CanceledError') {
        console.log('Request canceled');
        return { type: 'oneway', outbound: [], inbound: [], metadata: {} };
      }
      
      console.error('API Error in searchFlights:', error);
      throw error;
    }
  }
}