import api from "../../../api/axios";
import type { Tarifa } from "../pages/CrearVueloPage";

export interface CrearVueloPayload {
  id_aeronaveFK: number;
  id_aeropuerto_origenFK: number;
  id_aeropuerto_destinoFK: number;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  id_promocionFK?: number | null;
  estado: "Programado" | "En vuelo" | "Cancelado";
  tarifa: Tarifa[];
}

export const getAeropuertos = async () => {
  const res = await api.get("/airports");
  return res.data;
};

export const getAeronaves = async () => {
  const res = await api.get("/airplanes");
  return res.data;
};

export const crearVuelo = async (payload: CrearVueloPayload) => {
  const res = await api.post("/news", payload);
  return res.data;
};
