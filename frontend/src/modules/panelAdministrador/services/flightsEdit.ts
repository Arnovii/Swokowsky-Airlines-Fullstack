
import api from "../../../api/axios";
import type { CrearVueloPayload } from "../types/vuelo";

export const editarVuelo = async (id: number, payload: CrearVueloPayload) => {
  // Ajusta el endpoint si tu backend lo requiere (por ejemplo /flights/:id)
  const res = await api.put(`/news/${id}`, payload);
  return res.data;
};

