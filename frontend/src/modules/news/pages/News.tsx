import React, { useState } from "react";
import { useNews } from "../hooks/useNews";
import { usePromotions } from "../hooks/usePromotions";
import { useFlights } from "../hooks/useFlights";
import type { Article } from '../services/newsService';
import HeroCarousel from "../components/HeroCarousel";
import NewsCard from "../components/NewsCard";
import NewsDetailModal from "../components/NewsDetailModal";
import PromotionCard from "../components/PromotionCard";
import FlightCard from "../components/FlightCard";
import Carousel from "../components/Carousel";
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
    return <div className="text-center py-20 font-sans">Cargando contenido...</div>;
  }

  if (newsError) {
    return <div className="text-center py-20 text-red-500 font-sans">Error al cargar el contenido: {newsError}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Carrusel con noticias destacadas */}
        <HeroCarousel items={featured} onCallToAction={handleReadMore} />

        {/* Noticias recientes */}
        <FeaturedNews items={featured} onCallToAction={handleReadMore}/>
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