export interface Flight {
  idVuelo: number;
  estado: string;
  modeloAeronave: string;
  capacidadAeronave: number;
  precioEconomica: number;
  precioPrimeraClase: number;
  promocion?: {
    nombre: string;
    descuento: number;
    fechaInicio?: string;
    fechaFin?: string;
    remainingSeats?: number;
  };
  salidaProgramadaUtc: string;
  llegadaProgramadaUtc: string;
  horaSalidaUtc?: string;
  horaLlegadaUtc?: string;
  availableSeats: number;
  durationMinutes?: number;
  origen: {
    nombre: string;
    codigoIata: string;
    ciudad: string;
    pais: string;
  };
  destino: {
    nombre: string;
    codigoIata: string;
    ciudad: string;
    pais: string;
  };
  aeronave?: {
    idAeronave: number;
    modelo: string;
    capacidad: number;
  };
  tarifas?: Array<{
    clase: 'economica' | 'primera_clase';
    precioBase: number;
  }>;
  availableClasses?: string[];
  price?: number;
  priceFirstClass?: number;
  aircraftModel?: string;
  isInternational?: boolean;
  // Compatibilidad con FlightCard
  departureTimeUTC?: string;
  arrivalTimeUTC?: string;
  // Promoción normalizada para frontend
  promotion?: {
    name: string;
    discount: number;
    remainingSeats?: number;
  };
}

// Normalizador universal para adaptar cualquier resultado de vuelo
export function toCardFlight(raw: any): Flight {
  const idVuelo = raw.idVuelo ?? raw.id_vuelo ?? raw.id ?? 0;
  const salidaProgramadaUtc = raw.salidaProgramadaUtc ?? raw.salida_programada_utc ?? raw.departureTimeUTC ?? '';
  const llegadaProgramadaUtc = raw.llegadaProgramadaUtc ?? raw.llegada_programada_utc ?? raw.arrivalTimeUTC ?? '';
  
  // Normalizar promoción correctamente
  let promotion = undefined;
  if (raw.promocion) {
    promotion = {
      name: raw.promocion.nombre ?? '',
      discount: raw.promocion.descuento ?? 0,
      remainingSeats: raw.promocion.remainingSeats ?? raw.promocion.cupoRestante ?? 0,
    };
  } else if (raw.promotion) {
    // Si ya viene como promotion
    promotion = {
      name: raw.promotion.name ?? raw.promotion.nombre ?? '',
      discount: raw.promotion.discount ?? raw.promotion.descuento ?? 0,
      remainingSeats: raw.promotion.remainingSeats ?? raw.promotion.cupoRestante ?? 0,
    };
  }

  return {
    idVuelo,
    estado: raw.estado ?? '',
    modeloAeronave: raw.modeloAeronave ?? raw.modelo_aeronave ?? raw.aircraftModel ?? raw.aircraft_modelo ?? '',
    capacidadAeronave: raw.capacidadAeronave ?? raw.capacidad_aeronave ?? raw.aeronave?.capacidad ?? 0,
    precioEconomica: raw.precioEconomica ?? raw.precio_economica ?? raw.price ?? 0,
    precioPrimeraClase: raw.precioPrimeraClase ?? raw.precio_primera_clase ?? raw.priceFirstClass ?? 0,
    promocion: raw.promocion,
    promotion: promotion,
    salidaProgramadaUtc,
    llegadaProgramadaUtc,
    horaSalidaUtc: raw.horaSalidaUtc ?? raw.hora_salida_utc ?? '',
    horaLlegadaUtc: raw.horaLlegadaUtc ?? raw.hora_llegada_utc ?? '',
    availableSeats: raw.availableSeats ?? raw.available_seats ?? 0,
    durationMinutes: raw.durationMinutes ?? raw.duracion_minutos ?? 0,
    origen: raw.origen ?? raw.origin ?? {
      nombre: raw.origen?.nombre ?? raw.origin?.nombre ?? '',
      codigoIata: raw.origen?.codigoIata ?? raw.origen?.codigo_iata ?? raw.origin?.codigoIata ?? raw.origin?.codigo_iata ?? '',
      ciudad: raw.origen?.ciudad ?? raw.origin?.ciudad ?? '',
      pais: raw.origen?.pais ?? raw.origin?.pais ?? '',
    },
    destino: raw.destino ?? raw.destination ?? {
      nombre: raw.destino?.nombre ?? raw.destination?.nombre ?? '',
      codigoIata: raw.destino?.codigoIata ?? raw.destino?.codigo_iata ?? raw.destination?.codigoIata ?? raw.destination?.codigo_iata ?? '',
      ciudad: raw.destino?.ciudad ?? raw.destination?.ciudad ?? '',
      pais: raw.destino?.pais ?? raw.destination?.pais ?? '',
    },
    aeronave: raw.aeronave ? {
      idAeronave: raw.aeronave.idAeronave ?? raw.aeronave.id_aeronave ?? 0,
      modelo: raw.aeronave.modelo ?? '',
      capacidad: raw.aeronave.capacidad ?? 0,
    } : undefined,
    tarifas: raw.tarifas ?? raw.tarifa ?? [],
    availableClasses: raw.availableClasses ?? raw.clases_disponibles ?? [],
    price: raw.price ?? raw.precioEconomica ?? raw.precio_economica ?? 0,
    priceFirstClass: raw.priceFirstClass ?? raw.precioPrimeraClase ?? raw.precio_primera_clase ?? 0,
    aircraftModel: raw.aircraftModel ?? raw.modeloAeronave ?? raw.modelo_aeronave ?? '',
    isInternational: raw.isInternational ?? false,
    departureTimeUTC: salidaProgramadaUtc,
    arrivalTimeUTC: llegadaProgramadaUtc,
  };
}