import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Article } from '../services/newsService';
import NewsCard from './NewsCard';

interface NewsGridProps {
  items: Article[];
  onCallToAction: (article: Article) => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({ items, onCallToAction }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(items.length / 6));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(items.length / 6)) % Math.ceil(items.length / 6));
  };

  if (!items || items.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
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
        </div>
      </section>
    );
  }

  return (
    <section id="news-grid" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#081225] mb-4">
            Vuelos Disponibles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras ofertas y destinos disponibles
          </p>
        </div>

        {/* Grid de Noticias */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {items.slice(currentSlide * 6, (currentSlide * 6) + 6).map((article) => (
              <NewsCard 
                key={article.id}
                article={article}
                onReadMore={onCallToAction}
              />
            ))}
          </div>

          {/* Controles de navegación - Solo si hay más de 6 noticias */}
          {items.length > 6 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#0e254d] text-gray-600 hover:text-[#0e254d] transition-all"
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(items.length / 6) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === i 
                        ? 'bg-[#0e254d] scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir a la página ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#0e254d] text-gray-600 hover:text-[#0e254d] transition-all"
                aria-label="Siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;