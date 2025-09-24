
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  title: string;
  subtitle: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ 
  children, 
  title, 
  subtitle,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-6",
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(itemsPerView.desktop);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive items calculation
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(itemsPerView.mobile);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(itemsPerView.tablet);
      } else {
        setItemsToShow(itemsPerView.desktop);
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, [itemsPerView]);

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && children.length > itemsToShow) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => 
          prev + itemsToShow >= children.length ? 0 : prev + 1
        );
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, children.length, itemsToShow]);

  const maxIndex = Math.max(0, children.length - itemsToShow);

  const goToPrevious = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  };

  const goToNext = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  };

  const goToSlide = (index: number) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentIndex(Math.min(index, maxIndex));
  };

  if (children.length === 0) {
    return (
      <section className="my-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#081225] mb-4 font-sans">{title}</h2>
          <p className="text-lg text-gray-600 font-sans">{subtitle}</p>
        </div>
        <div className="text-center py-12 text-gray-500">
          No hay elementos para mostrar
        </div>
      </section>
    );
  }

  return (
    <section className="my-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#081225] mb-4 font-sans">{title}</h2>
        <p className="text-lg text-gray-600 font-sans">{subtitle}</p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        {children.length > itemsToShow && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} className="text-[#081225]" />
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} className="text-[#081225]" />
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden rounded-xl">
          <div 
            ref={containerRef}
            className={`flex transition-transform duration-300 ease-in-out ${gap}`}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(children.length / itemsToShow) * 100}%`
            }}
          >
            {children.map((child, index) => (
              <div 
                key={index} 
                className="flex-shrink-0"
                style={{ width: `${100 / children.length}%` }}
              >
                <div className="px-3">
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {children.length > itemsToShow && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-[#081225] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la página ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoPlay && children.length > itemsToShow && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-[#081225] h-1 rounded-full transition-all duration-100"
              style={{ 
                width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%` 
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Carousel;