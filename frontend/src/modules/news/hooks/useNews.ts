import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Article } from '../services/newsService';

interface NewsApiResponse {
  id: number;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  isFeatured: boolean;
  salida_programada_utc?: string;
  promocion?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

/**
 * Determina si una noticia debe mostrarse
 * REGLAS:
 * 1. Si tiene salida_programada_utc: ocultar 1 hora antes del vuelo
 * 2. Si tiene fecha_inicio: solo mostrar después de esa fecha
 * 3. Si tiene fecha_fin: solo mostrar antes de esa fecha
 * 4. Si NO tiene estos campos: SIEMPRE mostrar
 */
const shouldShowNews = (noticia: NewsApiResponse, now: Date): boolean => {
  console.log('🔍 Evaluando noticia:', noticia.id, noticia.title);

  // ⚠️ IMPORTANTE: Solo aplicar filtro si el campo existe
  // REGLA 1: Ocultar vuelos que salen en menos de 1 hora
  if (noticia.salida_programada_utc) {
    try {
      const flightTime = new Date(noticia.salida_programada_utc);
      const oneHourBefore = new Date(flightTime.getTime() - 60 * 60 * 1000);
      
      console.log('⏰ Vuelo sale:', flightTime.toLocaleString());
      console.log('🕐 Ocultar desde:', oneHourBefore.toLocaleString());
      console.log('📍 Ahora es:', now.toLocaleString());
      
      if (now >= oneHourBefore) {
        console.log('❌ OCULTA: Vuelo sale en menos de 1 hora');
        return false;
      }
      console.log('✅ Vuelo aún no está cerca de salir');
    } catch (error) {
      console.error('Error parseando fecha de vuelo:', error);
      // Si hay error en la fecha, mostrar la noticia
      return true;
    }
  } else {
    console.log('ℹ️ No tiene fecha de vuelo, continúa...');
  }
  
  // REGLA 2 y 3: Verificar fechas de promoción
  if (noticia.promocion) {
    // Verificar fecha inicio
    if (noticia.promocion.fecha_inicio) {
      try {
        const fechaInicio = new Date(noticia.promocion.fecha_inicio);
        console.log('📅 Promoción inicia:', fechaInicio.toLocaleString());
        
        if (now < fechaInicio) {
          console.log('❌ OCULTA: Promoción aún no ha empezado');
          return false;
        }
        console.log('✅ Promoción ya empezó');
      } catch (error) {
        console.error('Error parseando fecha_inicio:', error);
      }
    }
    
    // Verificar fecha fin
    if (noticia.promocion.fecha_fin) {
      try {
        const fechaFin = new Date(noticia.promocion.fecha_fin);
        console.log('📅 Promoción termina:', fechaFin.toLocaleString());
        
        if (now > fechaFin) {
          console.log('❌ OCULTA: Promoción ya terminó');
          return false;
        }
        console.log('✅ Promoción aún está vigente');
      } catch (error) {
        console.error('Error parseando fecha_fin:', error);
      }
    }
  } else {
    console.log('ℹ️ No tiene promoción, continúa...');
  }
  
  console.log('✅ VISIBLE: Noticia pasa todos los filtros\n');
  return true;
};

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data } = await axios.get<NewsApiResponse[]>(
          'http://localhost:3000/api/v1/news'
        );
        
        console.log('📰 Total noticias recibidas:', data.length);
        const now = new Date();
        console.log('🕐 Fecha/Hora actual:', now.toLocaleString(), '\n');
        
        const filteredData = data.filter(noticia => shouldShowNews(noticia, now));
        
        console.log('✅ Noticias visibles:', filteredData.length);
        console.log('❌ Noticias ocultas:', data.length - filteredData.length);
        
        setArticles(filteredData);
        setFeatured(filteredData.filter(article => article.isFeatured));
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError(err.message || 'Error al cargar las noticias');
        setArticles([]);
        setFeatured([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();

    // Recargar cada 5 minutos
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { articles, featured, isLoading, error };
}


