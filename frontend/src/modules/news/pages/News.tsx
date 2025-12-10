import { useNavigate } from "react-router-dom";
import { useNews } from "../hooks/useNews";
import type { Article } from '../services/newsService';
import HeroCarousel from "../components/HeroCarousel";
import NewsGrid from "../components/NewsGrid";

export default function NewsPage() {
  const { articles, featured, isLoading, error } = useNews();
  const navigate = useNavigate();

  const handleReadMore = (article: Article) => {
    // Navegar a la página de detalle del vuelo
    navigate(`/noticias/vuelo/${article.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e254d] mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 font-sans">
        Error al cargar el contenido: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Carrusel Hero con noticias destacadas */}
        {featured.length > 0 && (
          <HeroCarousel 
            items={featured} 
            onCallToAction={handleReadMore} 
          />
        )}
        
        {/* Grid de todas las noticias */}
        <NewsGrid 
          items={articles} 
          onCallToAction={handleReadMore}
        />
      </main>
    </div>
  );
}