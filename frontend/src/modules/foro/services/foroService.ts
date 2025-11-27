import api from '../../../api/axios';

// Tipos
export type CategoriaHilo = 'queja' | 'duda' | 'recomendacion' | 'halago';

export interface Hilo {
  id_hilo: number;
  titulo: string;
  contenido: string;
  categoria: CategoriaHilo;
  creado_en: string;
  id_usuarioFK: number;
  autor?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    username: string;
    img_url?: string;
  };
  respuestas?: Respuesta[];
  _count?: {
    respuestas: number;
  };
}

export interface Respuesta {
  id_respuesta: number;
  contenido: string;
  creado_en: string;
  id_hiloFK: number;
  id_usuarioFK: number;
  autor?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    username: string;
    img_url?: string;
    tipo_usuario?: string;
  };
}

export interface CreateHiloDto {
  titulo: string;
  contenido: string;
  categoria: CategoriaHilo;
}

export interface CreateRespuestaDto {
  contenido: string;
}

// Servicio del Foro
const foroService = {
  // Obtener hilos públicos (sin autenticación requerida)
  getHilosPublicos: async (): Promise<Hilo[]> => {
    const response = await api.get('/foro/publico');
    return response.data;
  },

  // Obtener mis hilos (usuario autenticado)
  getMisHilos: async (): Promise<Hilo[]> => {
    const response = await api.get('/foro/mis-hilos');
    return response.data;
  },

  // Obtener detalle de un hilo con sus respuestas
  getHiloDetalle: async (id_hilo: number): Promise<Hilo> => {
    const response = await api.get(`/foro/hilos/${id_hilo}`);
    return response.data;
  },

  // Crear un nuevo hilo
  crearHilo: async (data: CreateHiloDto): Promise<Hilo> => {
    const response = await api.post('/foro/hilos', data);
    return response.data;
  },

  // Responder a un hilo
  responderHilo: async (id_hilo: number, data: CreateRespuestaDto): Promise<Respuesta> => {
    const response = await api.post(`/foro/hilos/${id_hilo}/responder`, data);
    return response.data;
  },

  // ADMIN: Obtener todos los hilos
  getAllHilos: async (): Promise<Hilo[]> => {
    const response = await api.get('/foro/admin/all');
    return response.data;
  },
};

export default foroService;
