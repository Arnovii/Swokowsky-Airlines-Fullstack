import api from "../../../api/axios";
import type { Tarifa, CrearVueloPayload } from "../types/vuelo";

export type { CrearVueloPayload };
export type { Tarifa };

// Tipo para el payload de crear noticia/vuelo (endpoint /news)
export interface CrearNoticiaPayload {
  titulo?: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
  url_imagen?: string;
  precio_economica?: number;
  precio_primera_clase?: number;
  promocion?: {
    nombre: string;
    descripcion: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
  };
  salida_colombia?: string;
  llegada_colombia?: string;
  id_aeronaveFK?: number;
  id_aeropuerto_origenFK?: number;
  id_aeropuerto_destinoFK?: number;
}

export const getAeropuertos = async () => {
  const res = await api.get("/airports");
  return res.data;
};

export const getAeronaves = async () => {
  const res = await api.get("/airplanes");
  return res.data;
};

export const crearVuelo = async (payload: CrearNoticiaPayload) => {
  const res = await api.post("/news", payload);
  return res.data;
};
