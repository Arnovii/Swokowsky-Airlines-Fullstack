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
}
