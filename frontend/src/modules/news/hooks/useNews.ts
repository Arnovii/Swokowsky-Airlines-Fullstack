import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Article } from '../services/newsService';

export interface NewsApiResponse {
  titulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  url_imagen: string;
  
  // Campos de fecha del vuelo (pueden venir en diferentes formatos)
  salida_programada_utc?: string;
  salida_colombia?: string;
  llegada_programada_utc?: string;
  llegada_colombia?: string;
  
  promocion?: {
    nombre?: string;
    descripcion?: string;
    descuento?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  };
}

/**
 * Determina si una noticia debe mostrarse
 * REGLA SIMPLIFICADA:
 * - Si tiene vuelo: MOSTRAR solo si falta más de 1 hora para que salga
 * - Si tiene promoción: MOSTRAR solo si está dentro del rango de fechas
 * - Si no tiene ninguno: SIEMPRE mostrar
 */
const shouldShowNews = (noticia: NewsApiResponse, now: Date): boolean => {
  console.log('🔍 Evaluando noticia:', noticia.titulo);

  // REGLA 1: Si tiene vuelo, verificar que NO esté próximo a salir
  if (noticia.salida_programada_utc) {
    try {
      const flightTime = new Date(noticia.salida_programada_utc);
      const oneHourBefore = new Date(flightTime.getTime() - 60 * 60 * 1000);
      
      // Ocultar si ya pasó la hora límite (1 hora antes del vuelo)
      if (now >= oneHourBefore) {
        console.log('❌ OCULTA: Vuelo sale en menos de 1 hora o ya salió');
        console.log(`   Vuelo: ${flightTime.toLocaleString()}`);
        console.log(`   Límite: ${oneHourBefore.toLocaleString()}`);
        console.log(`   Ahora: ${now.toLocaleString()}\n`);
        return false;
      }
      
      console.log('✅ Vuelo visible: Falta más de 1 hora para salir');
      console.log(`   Vuelo: ${flightTime.toLocaleString()}`);
      console.log(`   Ahora: ${now.toLocaleString()}`);
    } catch (error) {
      console.error('❌ Error parseando fecha de vuelo:', error);
      // En caso de error, mejor mostrar la noticia
      return true;
    }
  } else {
    console.log('ℹ️  No tiene fecha de vuelo');
  }
  
  // REGLA 2: Si tiene promoción, verificar que esté vigente
  if (noticia.promocion) {
    let promocionValida = true;
    
    // Verificar fecha inicio
    if (noticia.promocion.fecha_inicio) {
      try {
        const fechaInicio = new Date(noticia.promocion.fecha_inicio);
        if (now < fechaInicio) {
          console.log('❌ OCULTA: Promoción aún no ha empezado');
          console.log(`   Inicia: ${fechaInicio.toLocaleString()}`);
          console.log(`   Ahora: ${now.toLocaleString()}\n`);
          return false;
        }
        console.log('✅ Promoción ya empezó');
      } catch (error) {
        console.error('❌ Error parseando fecha_inicio:', error);
      }
    }
    
    // Verificar fecha fin
    if (noticia.promocion.fecha_fin) {
      try {
        const fechaFin = new Date(noticia.promocion.fecha_fin);
        if (now > fechaFin) {
          console.log('❌ OCULTA: Promoción ya terminó');
          console.log(`   Terminó: ${fechaFin.toLocaleString()}`);
          console.log(`   Ahora: ${now.toLocaleString()}\n`);
          return false;
        }
        console.log('✅ Promoción aún está vigente');
      } catch (error) {
        console.error('❌ Error parseando fecha_fin:', error);
      }
    }
  } else {
    console.log('ℹ️  No tiene promoción');
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
        
        console.log('🌐 Obteniendo noticias de la API...');
        
        // 1. Obtener datos de la API
        const { data } = await axios.get<NewsApiResponse[]>(
          'http://localhost:3000/api/v1/news'
        );
        
        console.log(`📥 Total noticias recibidas: ${data.length}`);
        console.log('📋 Datos recibidos:', data);
        
        const now = new Date();
        console.log(`🕐 Hora actual: ${now.toLocaleString()}\n`);
        
        // 2. Filtrar los datos con la lógica shouldShowNews
        const filteredData = data.filter(noticia => shouldShowNews(noticia, now));
        
        console.log(`\n✅ Noticias después del filtro: ${filteredData.length}`);
        
        // 3. ✨ MAPEO: Convertir NewsApiResponse a Article
        const mappedArticles: Article[] = filteredData.map((apiItem, index) => ({
          id: index + 1,
          title: apiItem.titulo,
          summary: apiItem.descripcion_corta,
          content: apiItem.descripcion_larga,
          imageUrl: apiItem.url_imagen,
          // Marcar como destacadas: las que tienen promoción O las primeras 3
          isFeatured: apiItem.promocion ? true : index < 3
        }));
        
        console.log('📊 Noticias mapeadas:', mappedArticles);
        
        setArticles(mappedArticles);
        setFeatured(mappedArticles.filter(article => article.isFeatured)); 
      } catch (err: any) {
        console.error('❌ Error al obtener noticias:', err);
        setError(err.message || 'Error al cargar las noticias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    
    // Refrescar cada 5 minutos para actualizar el filtro
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { articles, featured, isLoading, error };
}