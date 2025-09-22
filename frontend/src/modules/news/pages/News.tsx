import React, { useState } from "react";
// CORRECCIÓN: Se añade la importación del hook
import { useNews } from "../hooks/useNews"; 
import type { Article } from '../services/newsService';
import HeroCarousel from "../components/HeroCarousel";
import NewsCard from "../components/NewsCard";
import NewsDetailModal from "../components/NewsDetailModal";

export default function NewsPage() {
  const { articles, featured, isLoading, error } = useNews();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Simulación del estado de autenticación. Deberías reemplazar esto con tu lógica real.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (isLoading) {
    return <div className="text-center py-20">Cargando noticias...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error al cargar las noticias: {error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Carrusel con noticias destacadas */}
        <HeroCarousel items={featured} onCallToAction={handleReadMore} />

        {/* Grid de noticias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} onReadMore={handleReadMore} />
          ))}
        </div>
      </main>

      {/* Modal para ver el detalle de la noticia */}
      <NewsDetailModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isAuth={isAuthenticated}
      />
    </div>
  );
}
