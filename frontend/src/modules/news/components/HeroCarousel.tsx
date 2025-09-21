
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Eye } from 'lucide-react';

// Tipos de datos
interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
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

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !items || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, items, interval]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
            <Calendar size={32} />
          </div>
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
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105 group-hover:scale-110"
        style={{ backgroundImage: `url('${currentItem.imageUrl}')` }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Artículo anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Siguiente artículo"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 md:p-12">
        <div className="max-w-4xl">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[#0e254d]/90 backdrop-blur-sm text-white shadow-lg">
              {currentItem.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl tracking-wide">
            {currentItem.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 drop-shadow-lg leading-relaxed max-w-3xl line-clamp-3">
            {currentItem.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm font-medium">{formatDate(currentItem.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm font-medium">{currentItem.readTime}</span>
            </div>
            {currentItem.views && (
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span className="text-sm font-medium">{formatViews(currentItem.views)} vistas</span>
              </div>
            )}
            {currentItem.author && (
              <div className="flex items-center gap-2">
                {currentItem.author.avatar && (
                  <img 
                    src={currentItem.author.avatar} 
                    alt={currentItem.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">{currentItem.author.name}</span>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <button
            onClick={() => onArticleClick(currentItem)}
            className="inline-flex items-center px-8 py-4 bg-[#0e254d] hover:bg-[#0a1a3a] text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            <span className="mr-2">Leer Artículo Completo</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al artículo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {items.length > 1 && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="h-1 bg-white/20">
            <div 
              className="h-full bg-[#0e254d] transition-all duration-100 ease-linear"
              style={{ 
                width: `${((Date.now() % interval) / interval) * 100}%`,
                animation: `progress-bar ${interval}ms linear infinite`
              }}
            />
          </div>
        </div>
      )}

      {/* Play/Pause Control */}
      {items.length > 1 && (
        <button
          onClick={togglePlayPause}
          className="absolute top-6 right-6 z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <div className="w-4 h-4 flex space-x-1">
              <div className="w-1 h-4 bg-current"></div>
              <div className="w-1 h-4 bg-current"></div>
            </div>
          ) : (
            <div className="w-0 h-0 border-l-[8px] border-l-current border-y-[6px] border-y-transparent ml-1"></div>
          )}
        </button>
      )}
    </div>
  );
};

export default HeroCarousel;
