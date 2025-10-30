// Tipos explícitos para Aeropuerto y Metadata
export interface Aeropuerto {
  id_aeropuerto: number;
  id_ciudadFK: number;
  nombre: string;
  codigo_iata: string;
}

// Puedes ajustar este tipo si conoces la estructura real de metadata
type Metadata = Record<string, unknown>;
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

interface RawFlight {
  id_vuelo?: number;
  precio_economica?: number;
  precio_base?: number;
  precio_primera_clase?: number;
  fecha_salida_programada?: string;
  hora_salida_utc?: string;
  fecha_llegada_programada?: string;
  hora_llegada_utc?: string;
  available_seats?: number;
  origen?: Aeropuerto;
  destino?: Aeropuerto;
  modelo_aeronave?: string;
  clases_disponibles?: string[];
  promocion?: {
    nombre?: string;
    descuento?: number;
    cupoRestante?: number;
  } | null;
}

function normalizeFlightData(flight: RawFlight): NormalizedFlight {
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
  metadata: Metadata;
}

export class FlightService {
  static async searchFlights(searchCriteria: Record<string, unknown>, options: { signal?: AbortSignal } = {}): Promise<FlightSearchResponse> {
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
        outboundFlights = (data.outbound || []).map((f: RawFlight) => normalizeFlightData(f));
        inboundFlights = (data.inbound || []).map((f: RawFlight) => normalizeFlightData(f));
      } else if (data.type === 'oneway') {
        outboundFlights = (data.results || []).map((f: RawFlight) => normalizeFlightData(f));
      }

      return {
        type: data.type,
        outbound: outboundFlights,
        inbound: inboundFlights,
        metadata: data.metadata || {},
      };

    } catch (error) {
      if ((error as { name?: string }).name === 'CanceledError') {
        console.log('Request canceled');
        return { type: 'oneway', outbound: [], inbound: [], metadata: {} };
      }

      console.error('API Error in searchFlights:', error);
      throw error;
    }
  }

  // Nueva funcionalidad: obtener detalle de vuelo por ID
  static async getFlightById(id: number) {
    try {
      const response = await api.get(`/flights/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error in getFlightById:', error);
      throw error;
    }
  }
}
