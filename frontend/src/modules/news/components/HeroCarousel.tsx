import FilterSearchBar from "@/modules/home/components/filterSearchBar";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Eye } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt?: string; // ahora opcional
  category: string;
  readTime: string;
  views?: number;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface HeroCarouselProps {
  items: Article[];
  onArticleClick: (article: Article) => void;
  autoPlay?: boolean;
  interval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  items, 
  onArticleClick, 
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-200 rounded-2xl overflow-hidden mb-12 shadow-xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No hay noticias disponibles</p>
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
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Contenido */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 md:p-12">
        <div className="max-w-4xl">
          <span className="inline-flex items-center px-4 py-2 mb-4 rounded-full text-sm font-bold bg-[#0e254d]/90 text-white">
            {currentItem.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{currentItem.title}</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6">{currentItem.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm">{formatDate(currentItem.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm">{currentItem.readTime}</span>
            </div>
            {currentItem.views && (
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span className="text-sm">{formatViews(currentItem.views)} vistas</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroCarousel;
