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

        {/* Carrusel de Promociones */}
        {promotionsLoading ? (
          <section className="my-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#081225] mb-4 font-sans">
                🔥 Promociones Especiales
              </h2>
              <p className="text-lg text-gray-600 font-sans">
                Aprovecha nuestras ofertas exclusivas con descuentos increíbles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <Carousel
            title="Promociones Especiales"
            subtitle="Aprovecha nuestras ofertas exclusivas con descuentos increíbles"
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
            autoPlay={true}
            autoPlayInterval={6000}
          >
            {promotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </Carousel>
        )}

        {/* Carrusel de Vuelos */}
        {flightsLoading ? (
          <section className="my-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#081225] mb-4 font-sans">
                ✈️ Nuestros Vuelos
              </h2>
              <p className="text-lg text-gray-600 font-sans">
                Descubre todos los destinos disponibles con las mejores tarifas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <Carousel
            title="Nuestros Vuelos"
            subtitle="Descubre todos los destinos disponibles con las mejores tarifas"
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
            autoPlay={false}
          >
            {flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </Carousel>
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