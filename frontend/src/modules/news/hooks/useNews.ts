import { useState, useEffect } from 'react';
import type { Article } from '../services/newsService';
import api from '../../../api/axios';

export interface NewsApiResponse {
  id_noticia: number;
  id_vueloFK?: number;
  titulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  url_imagen: string;
  fecha_partida_colombia?: string; // Formato: "DD/MM/YYYY"
  hora_partida_colombia?: string;   // Formato: "HH:MM"
}

/**
 * Convierte fecha "DD/MM/YYYY" y hora "HH:MM" a objeto Date
 */
const parseFlightDateTime = (fecha: string, hora: string): Date => {
  // Parsear fecha: "10/10/2025" -> día, mes, año
  const [dia, mes, anio] = fecha.split('/').map(Number);
  
  // Parsear hora: "07:00" o "24:00" -> horas, minutos
  let [horas, minutos] = hora.split(':').map(Number);
  
  // Manejar caso especial de "24:00" (medianoche del día siguiente)
  if (horas === 24) {
    horas = 0;
    const date = new Date(anio, mes - 1, dia + 1, horas, minutos);
    return date;
  }
  
  // Crear fecha (mes - 1 porque JavaScript cuenta meses desde 0)
  return new Date(anio, mes - 1, dia, horas, minutos);
};

/**
 * Determina si una noticia debe mostrarse
 * REGLAS:
 * - Si tiene fecha/hora de vuelo: MOSTRAR solo si falta MÁS de 1 hora
 * - Si no tiene vuelo: SIEMPRE mostrar
 */
const shouldShowNews = (noticia: NewsApiResponse, now: Date): boolean => {
  console.log('🔍 Evaluando noticia:', noticia.titulo);
  console.log('   📦 Campos disponibles:', Object.keys(noticia));
  console.log('   📅 fecha_partida_colombia:', noticia.fecha_partida_colombia);
  console.log('   ⏰ hora_partida_colombia:', noticia.hora_partida_colombia);

  // Si tiene fecha y hora de partida del vuelo
  if (noticia.fecha_partida_colombia && noticia.hora_partida_colombia) {
    try {
      // Crear fecha completa del vuelo
      const flightTime = parseFlightDateTime(
        noticia.fecha_partida_colombia,
        noticia.hora_partida_colombia
      );
      
      // Calcular 1 hora antes del vuelo
      const oneHourBefore = new Date(flightTime.getTime() - 60 * 60 * 1000);
      
      console.log(`   📅 Vuelo: ${flightTime.toLocaleString('es-CO')}`);
      console.log(`   ⏰ Límite (1h antes): ${oneHourBefore.toLocaleString('es-CO')}`);
      console.log(`   🕐 Ahora: ${now.toLocaleString('es-CO')}`);
      
      // Si ya pasó la hora límite (1 hora antes), ocultar
      if (now >= oneHourBefore) {
        console.log('   ❌ OCULTA: Faltan menos de 1 hora o ya salió\n');
        return false;
      }
      
      console.log('   ✅ VISIBLE: Falta más de 1 hora\n');
      return true;
      
    } catch (error) {
      console.error('❌ Error parseando fecha/hora:', error);
      // En caso de error, mostrar la noticia por seguridad
      return true;
    }
  } else {
    console.log('   ℹ️  No tiene fecha de vuelo - SIEMPRE visible\n');
    return true;
  }
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
        const { data } = await api.get<NewsApiResponse[]>('/news');
        
        console.log(`📥 Total noticias recibidas: ${data.length}`);
        console.log('📋 Datos recibidos:', data);
        
        // 🔍 DEBUG: Mostrar la primera noticia completa para ver su estructura
        if (data.length > 0) {
          console.log('🔬 ESTRUCTURA DE LA PRIMERA NOTICIA:');
          console.log(JSON.stringify(data[0], null, 2));
        }
        
        const now = new Date();
        console.log(`🕐 Hora actual: ${now.toLocaleString('es-CO')}\n`);
        
        // 2. Filtrar los datos con la lógica shouldShowNews
        const filteredData = data.filter(noticia => shouldShowNews(noticia, now));
        
        console.log(`\n✅ Noticias después del filtro: ${filteredData.length}`);
        
        // 3. ✨ MAPEO: Convertir NewsApiResponse a Article
        const mappedArticles: Article[] = filteredData.map((apiItem) => ({
          id: apiItem.id_noticia,
          title: apiItem.titulo,
          summary: apiItem.descripcion_corta,
          content: apiItem.descripcion_larga,
          imageUrl: apiItem.url_imagen,
          // Marcar como destacadas las primeras 3
          isFeatured: filteredData.indexOf(apiItem) < 3
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