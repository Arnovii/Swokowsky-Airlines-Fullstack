import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { Article } from '../services/newsService';

interface HeroCarouselProps {
  items: Article[];
  onCallToAction: (article: Article) => void;
  autoPlay?: boolean;
  interval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  items, 
  onCallToAction, 
  autoPlay = true,
  interval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || !items || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, items, interval]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPrevious();
      else if (event.key === 'ArrowRight') goToNext();
      else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToNext = () => setCurrentIndex((prev) => prev === items.length - 1 ? 0 : prev + 1);
  const goToPrevious = () => setCurrentIndex((prev) => prev === 0 ? items.length - 1 : prev - 1);
  const togglePlayPause = () => setIsPlaying(!isPlaying);

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-200 rounded-2xl overflow-hidden mb-12 shadow-xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No hay vuelos disponibles en este momento</p>
          <p className="text-sm mt-2">Las promociones han finalizado o los vuelos están próximos a salir</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div 
      className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl overflow-hidden mb-12 shadow-2xl group"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(autoPlay)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105 group-hover:scale-110"
        style={{ backgroundImage: `url('${currentItem.imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Botones navegación */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Contenido */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 md:p-12">
        <div className="max-w-4xl">
          <span className="inline-flex items-center px-4 py-2 mb-4 rounded-full text-sm font-bold bg-[#0e254d]/90 text-white">
            General
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {currentItem.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6">
            {currentItem.summary}
          </p>

          <button
            onClick={() => onCallToAction(currentItem)}
            className="px-6 py-3 bg-[#0e254d] hover:bg-[#1a3a6b] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Leer más
          </button>
        </div>
      </div>

      {/* Indicadores */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a la noticia ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;