import api from '../../../api/axios';

// Tipos
export interface Autor {
  id_usuario: number;
  nombre: string;
  apellido: string;
  username: string;
  img_url: string;
  tipo_usuario: string;
}

export interface Mensaje {
  id_mensaje: number;
  contenido: string;
  creado_en: string;
  leido: boolean;
  id_conversacionFK: number;
  id_autorFK: number;
  autor: Autor;
}

export interface Conversacion {
  id_conversacion: number;
  asunto: string;
  estado: 'abierto' | 'cerrado';
  creado_en: string;
  actualizado_en: string;
  id_usuarioFK: number;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    username: string;
    img_url: string;
  };
  mensajes: Mensaje[];
  _count?: {
    mensajes: number;
  };
}

// ==================== CLIENTE ====================

// Crear nueva conversación
export const crearConversacion = async (asunto: string, mensaje: string): Promise<Conversacion> => {
  const response = await api.post('/chat/conversaciones', { asunto, mensaje });
  return response.data;
};

// Obtener mis conversaciones
export const getMisConversaciones = async (): Promise<Conversacion[]> => {
  const response = await api.get('/chat/mis-conversaciones');
  return response.data;
};

// Obtener detalle de una conversación
export const getConversacion = async (id: number): Promise<Conversacion> => {
  const response = await api.get(`/chat/conversaciones/${id}`);
  return response.data;
};

// Enviar mensaje
export const enviarMensaje = async (id_conversacion: number, contenido: string): Promise<Mensaje> => {
  const response = await api.post(`/chat/conversaciones/${id_conversacion}/mensajes`, { contenido });
  return response.data;
};

// ==================== ADMIN ====================

// Obtener todas las conversaciones (admin)
export const getTodasLasConversaciones = async (): Promise<Conversacion[]> => {
  const response = await api.get('/chat/admin/conversaciones');
  return response.data;
};

// Cerrar conversación (admin)
export const cerrarConversacion = async (id: number): Promise<Conversacion> => {
  const response = await api.patch(`/chat/conversaciones/${id}/cerrar`);
  return response.data;
};

// Reabrir conversación (admin)
export const reabrirConversacion = async (id: number): Promise<Conversacion> => {
  const response = await api.patch(`/chat/conversaciones/${id}/reabrir`);
  return response.data;
};
