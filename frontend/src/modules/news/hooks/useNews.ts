import { useState, useEffect } from 'react';
import type { Article } from '../services/newsService';
// CORRECCIÓN: El nombre de la función importada ahora es el correcto.
import { getAllArticles, getFeaturedArticles } from '../services/newsService';

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [allData, featuredData] = await Promise.all([
          getAllArticles(),
          getFeaturedArticles() // Se usa el nombre correcto aquí también.
        ]);
        
        setArticles(allData);
        setFeatured(featuredData);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { articles, featured, isLoading, error };
}

