export class FlightTariffDto {
  clase: string;
  precio_base: number;
}

export class FlightAirportDto {
  id_aeropuerto: number;
  nombre: string;
  codigo_iata: string;
  ciudad: {
    id_ciudad: number;
    nombre: string;
    pais: { id_pais: number; nombre: string };
    gmt: { id_gmt: number; offset: number };
  };
}

export class FlightResultDto {
  id_vuelo: number;
  estado: string;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  salida_local?: string | null;
  llegada_local?: string | null;
  aeronave: { id_aeronave: number; modelo: string; capacidad: number };
  tarifas: FlightTariffDto[];
  promocion?: { id_promocion: number; nombre: string; descuento: number } | null;
  aeropuerto_origen: FlightAirportDto;
  aeropuerto_destino: FlightAirportDto;
  available_seats: number;
}
