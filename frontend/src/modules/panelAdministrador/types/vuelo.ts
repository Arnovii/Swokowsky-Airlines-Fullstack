export interface Tarifa {
  clase: 'economica' | 'primera_clase';
  precio_base: number;
}

export interface CrearVueloPayload {
  id_aeronaveFK: number;
  id_aeropuerto_origenFK: number;
  id_aeropuerto_destinoFK: number;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  id_promocionFK?: number | null;
  estado: "Programado" | "En vuelo" | "Cancelado";
  tarifa: Tarifa[];
  titulo?: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  url_imagen?: string;
  promocion?: boolean;
  promo_nombre?: string;
  promo_descripcion?: string;
  descuento?: string | number;
  promocion_inicio?: string;
  promocion_fin?: string;
}
