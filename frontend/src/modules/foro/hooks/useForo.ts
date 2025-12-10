import { useState, useEffect, useCallback } from 'react';
import foroService from '../services/foroService';
import type { Hilo, CreateHiloDto } from '../services/foroService';

interface UseForoReturn {
  hilos: Hilo[];
  loading: boolean;
  error: string | null;
  crearHilo: (data: CreateHiloDto) => Promise<Hilo | null>;
  refetch: () => Promise<void>;
  creatingHilo: boolean;
}

export const useForo = (): UseForoReturn => {
  const [hilos, setHilos] = useState<Hilo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingHilo, setCreatingHilo] = useState(false);

  const fetchHilos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener hilos filtrados según el tipo de usuario
      // Admin/Root ven todos, clientes solo los suyos
      const data = await foroService.getHilosFiltrados();
      setHilos(data);
    } catch (err: any) {
      console.error('Error al obtener hilos:', err);
      setError(err.response?.data?.message || 'Error al cargar los hilos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHilos();
  }, [fetchHilos]);

  const crearHilo = async (data: CreateHiloDto): Promise<Hilo | null> => {
    setCreatingHilo(true);
    try {
      const nuevoHilo = await foroService.crearHilo(data);
      // Agregar al inicio de la lista
      setHilos(prev => [nuevoHilo, ...prev]);
      return nuevoHilo;
    } catch (err: any) {
      console.error('Error al crear hilo:', err);
      throw new Error(err.response?.data?.message || 'Error al crear el hilo');
    } finally {
      setCreatingHilo(false);
    }
  };

  const refetch = async () => {
    await fetchHilos();
  };

  return {
    hilos,
    loading,
    error,
    crearHilo,
    refetch,
    creatingHilo,
  };
};

// Hook para el detalle de un hilo
interface UseHiloDetalleReturn {
  hilo: Hilo | null;
  loading: boolean;
  error: string | null;
  responderHilo: (contenido: string) => Promise<void>;
  respondiendo: boolean;
  refetch: () => Promise<void>;
}

export const useHiloDetalle = (id_hilo: string | null): UseHiloDetalleReturn => {
  const [hilo, setHilo] = useState<Hilo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);

  const fetchHilo = useCallback(async () => {
    if (!id_hilo) return;
    
    const numericId = parseInt(id_hilo, 10);
    if (isNaN(numericId)) return;

    setLoading(true);
    setError(null);
    try {
      const data = await foroService.getHiloDetalle(numericId);
      setHilo(data);
    } catch (err: any) {
      console.error('Error al obtener hilo:', err);
      setError(err.response?.data?.message || 'Error al cargar el hilo');
    } finally {
      setLoading(false);
    }
  }, [id_hilo]);

  useEffect(() => {
    fetchHilo();
  }, [fetchHilo]);

  const responderHilo = async (contenido: string) => {
    if (!id_hilo) return;
    
    const numericId = parseInt(id_hilo, 10);
    if (isNaN(numericId)) return;

    setRespondiendo(true);
    try {
      const nuevaRespuesta = await foroService.responderHilo(numericId, { contenido });
      // Agregar la respuesta al hilo actual
      setHilo(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          respuestas: [...(prev.respuestas || []), nuevaRespuesta],
        };
      });
    } catch (err: any) {
      console.error('Error al responder:', err);
      throw new Error(err.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setRespondiendo(false);
    }
  };

  const refetch = async () => {
    await fetchHilo();
  };

  return {
    hilo,
    loading,
    error,
    responderHilo,
    respondiendo,
    refetch,
  };
};
