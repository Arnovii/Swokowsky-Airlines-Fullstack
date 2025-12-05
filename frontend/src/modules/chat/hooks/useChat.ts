import { useState, useEffect, useCallback } from 'react';
import type { Conversacion } from '../services/chatService';
import {
  getMisConversaciones,
  getTodasLasConversaciones,
  getConversacion,
  crearConversacion,
  enviarMensaje,
  cerrarConversacion,
  reabrirConversacion,
} from '../services/chatService';

export const useChat = (isAdmin: boolean = false) => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActual, setConversacionActual] = useState<Conversacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de conversaciones
  const cargarConversaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isAdmin
        ? await getTodasLasConversaciones()
        : await getMisConversaciones();
      setConversaciones(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Cargar detalle de una conversación
  const cargarConversacion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversacion(id);
      setConversacionActual(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la conversación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva conversación
  const nuevaConversacion = useCallback(async (asunto: string, mensaje: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crearConversacion(asunto, mensaje);
      setConversaciones((prev) => [data, ...prev]);
      setConversacionActual(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la conversación');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensaje
  const enviar = useCallback(async (id_conversacion: number, contenido: string) => {
    setError(null);
    try {
      const mensaje = await enviarMensaje(id_conversacion, contenido);
      // Actualizar la conversación actual con el nuevo mensaje
      setConversacionActual((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          mensajes: [...prev.mensajes, mensaje],
          actualizado_en: new Date().toISOString(),
        };
      });
      // Actualizar la lista de conversaciones
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === id_conversacion
            ? { ...c, mensajes: [mensaje], actualizado_en: new Date().toISOString() }
            : c
        )
      );
      return mensaje;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el mensaje');
      return null;
    }
  }, []);

  // Cerrar conversación (admin)
  const cerrar = useCallback(async (id: number) => {
    setError(null);
    try {
      await cerrarConversacion(id);
      setConversacionActual((prev) =>
        prev ? { ...prev, estado: 'cerrado' } : prev
      );
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === id ? { ...c, estado: 'cerrado' } : c
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar la conversación');
    }
  }, []);

  // Reabrir conversación (admin)
  const reabrir = useCallback(async (id: number) => {
    setError(null);
    try {
      await reabrirConversacion(id);
      setConversacionActual((prev) =>
        prev ? { ...prev, estado: 'abierto' } : prev
      );
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === id ? { ...c, estado: 'abierto' } : c
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reabrir la conversación');
    }
  }, []);

  // Cargar conversaciones al montar
  useEffect(() => {
    cargarConversaciones();
  }, [cargarConversaciones]);

  return {
    conversaciones,
    conversacionActual,
    loading,
    error,
    cargarConversaciones,
    cargarConversacion,
    nuevaConversacion,
    enviar,
    cerrar,
    reabrir,
    setConversacionActual,
  };
};
