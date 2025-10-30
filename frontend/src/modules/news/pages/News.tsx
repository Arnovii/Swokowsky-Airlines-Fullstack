import React, { useState } from "react";
import { useNews } from "../hooks/useNews";
import { usePromotions } from "../hooks/usePromotions";
import { useFlights } from "../hooks/useFlights";
import type { Article } from '../services/newsService';
import HeroCarousel from "../components/HeroCarousel";
import NewsDetailModal from "../components/NewsDetailModal";
import FeaturedNews from "../../home/components/FeaturedNews";

export default function NewsPage() {
  const { articles, featured, isLoading: newsLoading, error: newsError } = useNews();
  const { promotions, isLoading: promotionsLoading, error: promotionsError } = usePromotions();
  const { flights, isLoading: flightsLoading, error: flightsError } = useFlights();
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Simulación del estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  if (newsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e254d] mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (newsError) {
    return (
      <div className="text-center py-20 text-red-500 font-sans">
        Error al cargar el contenido: {newsError}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Carrusel con noticias destacadas */}
        {featured.length > 0 ? (
          <>
            <HeroCarousel items={featured} onCallToAction={handleReadMore} />
            
            {/* Noticias recientes */}
            <FeaturedNews items={featured} onCallToAction={handleReadMore}/>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay vuelos disponibles en este momento
            </h3>
            <p className="text-gray-500">
              Las promociones han finalizado o los vuelos están próximos a salir.
            </p>
          </div>
        )}
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