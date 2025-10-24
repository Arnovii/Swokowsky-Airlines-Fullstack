import api from '@/api/axios';

export interface NormalizedFlight {
  id: number | null;
  price: number;
  priceFirstClass: number;
  departureTimeUTC: string;
  arrivalTimeUTC: string;
  durationMinutes: number;
  availableSeats: number;
  origin: any;
  destination: any;
  aircraftModel: string;
  isInternational: boolean;
  availableClasses: string[];
  promotion: {
    name: string;
    discount: number;
    remainingSeats: number;
  } | null;
}

function normalizeFlightData(flight: any): NormalizedFlight {
  console.log('[normalizeFlightData] vuelo recibido:', flight); // Depuración de id_vuelo
  const departureDate = new Date(`${flight.fecha_salida_programada}T${flight.hora_salida_utc}:00Z`);
  const arrivalDate = new Date(`${flight.fecha_llegada_programada}T${flight.hora_llegada_utc}:00Z`);

  let durationInMinutes = 0;
  if (!isNaN(departureDate.getTime()) && !isNaN(arrivalDate.getTime())) {
    durationInMinutes = (arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60);
  }

  const isInternational = (flight.origen?.pais || '') !== (flight.destino?.pais || '');

  return {
    id: typeof flight.id_vuelo === 'number' ? flight.id_vuelo : null,
    price: flight.precio_economica || flight.precio_base || 0,
    priceFirstClass: flight.precio_primera_clase || 0,
    departureTimeUTC: `${flight.fecha_salida_programada || ''}T${flight.hora_salida_utc || ''}:00Z`,
    arrivalTimeUTC: `${flight.fecha_llegada_programada || ''}T${flight.hora_llegada_utc || ''}:00Z`,
    durationMinutes: durationInMinutes,
    availableSeats: flight.available_seats || 0,
    origin: flight.origen,
    destination: flight.destino,
    aircraftModel: flight.modelo_aeronave || "No especificado",
    isInternational,
    availableClasses: flight.clases_disponibles || [],
    promotion: flight.promocion ? {
      name: flight.promocion.nombre || '',
      discount: flight.promocion.descuento || 0,
      remainingSeats: flight.promocion.cupoRestante || 0,
    } : null,
  };
}

export interface FlightSearchResponse {
  type: 'oneway' | 'roundtrip';
  outbound: NormalizedFlight[];
  inbound: NormalizedFlight[];
  metadata: Record<string, any>;
}

export class FlightService {
  static async searchFlights(searchCriteria: Record<string, any>, options: { signal?: AbortSignal } = {}): Promise<FlightSearchResponse> {
    try {
      console.log('[FlightService] searchCriteria enviado:', searchCriteria); // <-- Verifica los datos enviados
      const response = await api.post('/flights/search', searchCriteria, {
        signal: options.signal,
      });

      const data = response.data;
      console.log('[FlightService] Respuesta cruda backend:', data); // <-- Verifica id_vuelo aquí

      let outboundFlights: NormalizedFlight[] = [];
      let inboundFlights: NormalizedFlight[] = [];

      if (data.type === 'roundtrip') {
        outboundFlights = (data.outbound || []).map(normalizeFlightData);
        inboundFlights = (data.inbound || []).map(normalizeFlightData);
      } else if (data.type === 'oneway') {
        outboundFlights = (data.results || []).map(normalizeFlightData);
      }

      return {
        type: data.type,
        outbound: outboundFlights,
        inbound: inboundFlights,
        metadata: data.metadata || {},
      };

    } catch (error: any) {
      if (error.name === 'CanceledError') {
        console.log('Request canceled');
        return { type: 'oneway', outbound: [], inbound: [], metadata: {} };
      }

      console.error('API Error in searchFlights:', error);
      throw error;
    }
  }
}
