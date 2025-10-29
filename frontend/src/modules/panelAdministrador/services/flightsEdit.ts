// Consulta los datos completos de un vuelo por su id
import api from "../../../api/axios";
import type { CrearVueloPayload } from "../types/vuelo"
export const getVueloById = async (id: number) => {
  const res = await api.get(`/news/${id}`);
  return res.data;
};

;

export const editarVuelo = async (id: number, payload: CrearVueloPayload) => {
  // Usamos /news porque el backend maneja vuelos a través del módulo de noticias
  const res = await api.put(`/news/${id}`, payload);
  return res.data;
};

