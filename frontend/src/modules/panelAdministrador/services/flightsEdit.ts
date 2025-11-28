// Servicios para edición de vuelos
import api from "../../../api/axios";

// Interfaz para la respuesta del vuelo de la API
export interface VueloAPIResponse {
  id_vuelo: number;
  id_aeronaveFK: number;
  id_aeropuerto_origenFK: number;
  id_aeropuerto_destinoFK: number;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  id_promocionFK: number | null;
  estado: string;
  aeronave: {
    id_aeronave: number;
    modelo: string;
  };
  tarifa: {
    id_tarifa: number;
    id_vueloFK: number;
    clase: "economica" | "primera_clase";
    precio_base: number;
  }[];
  promocion: {
    id_promocion: number;
    nombre: string;
    descripcion: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
  } | null;
  noticia: {
    id_noticia: number;
    id_vueloFK: number;
    titulo: string;
    descripcion_corta: string;
    descripcion_larga: string;
    url_imagen: string;
  } | null;
  aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
    id_aeropuerto: number;
    id_ciudadFK: number;
    nombre: string;
    codigo_iata: string;
  };
  aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
    id_aeropuerto: number;
    id_ciudadFK: number;
    nombre: string;
    codigo_iata: string;
  };
  ocupantes_primera_clase: number;
  ocupantes_segunda_clase: number;
}

// Obtener todos los vuelos
export const getVuelos = async (): Promise<VueloAPIResponse[]> => {
  const res = await api.get("/flights");
  return res.data;
};

// Obtener un vuelo por su ID (filtrando de la lista completa)
export const getVueloById = async (id: number): Promise<VueloAPIResponse | null> => {
  try {
    const res = await api.get("/flights");
    const vuelos: VueloAPIResponse[] = res.data;
    const vuelo = vuelos.find(v => v.id_vuelo === id);
    return vuelo || null;
  } catch (error) {
    console.error("Error al obtener vuelo:", error);
    return null;
  }
};

// Verificar si el vuelo tiene ventas (ocupantes > 0)
export const verificarVentasVuelo = (vuelo: VueloAPIResponse): boolean => {
  return (vuelo.ocupantes_primera_clase > 0 || vuelo.ocupantes_segunda_clase > 0);
};

// Interfaz para la respuesta de la noticia
export interface NoticiaAPIResponse {
  titulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  url_imagen: string;
  modelo_aeronave: string;
  capacidad_aeronave: number;
  asientos_economica: number;
  asientos_primera_clase: number;
  precio_economica: number;
  precio_primera_clase: number;
  promocion: {
    nombre: string;
    descripcion: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
  } | null;
  estado: string;
  salida_programada_utc: string;
  llegada_programada_utc: string;
}

// Obtener la noticia asociada a un vuelo por su ID
export const getNoticiaById = async (id: number): Promise<NoticiaAPIResponse | null> => {
  try {
    const res = await api.get(`/news/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error al obtener noticia:", error);
    return null;
  }
};

// Interfaz para el payload de actualización de vuelo (según UpdateFlightDto del backend)
export interface UpdateFlightPayload {
  salida_programada_utc?: string;
  llegada_programada_utc?: string;
  promocion?: {
    id_promocion?: number;
    nombre: string;
    descripcion: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
  };
}

// Editar un vuelo (usa PATCH según el backend)
// Solo envía los campos que acepta el UpdateFlightDto: salida, llegada y promoción
export const editarVuelo = async (id: number, payload: UpdateFlightPayload) => {
  const res = await api.patch(`/flights/${id}`, payload);
  return res.data;
};

