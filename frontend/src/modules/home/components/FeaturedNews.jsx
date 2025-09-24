import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsService } from '../services/newsService';

const FeaturedNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      setLoading(true);
      const response = await NewsService.getFeaturedNews(6);
      setNews(response.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(news.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(news.length / 3)) % Math.ceil(news.length / 3));
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error al cargar noticias</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFeaturedNews}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#081225] mb-4">
            Noticias Destacadas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mantente informado con las últimas novedades, promociones y destinos de Swokowsky Airlines
          </p>
        </div>

        {/* Grid de Noticias */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {news.slice(currentSlide * 3, (currentSlide * 3) + 6).map((article) => (
              <article
                key={article.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  </div>
                  {article.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">
                        ⭐ Destacada
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#081225] mb-3 line-clamp-2 group-hover:text-[#0e254d] transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Meta información */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{formatViews(article.views)}</span>
                    </div>
                  </div>

                  {/* Autor */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {article.author.avatar ? (
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {article.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {article.author.name}
                      </span>
                    </div>

                    <button
                      onClick={() => window.location.href = `/news/${article.slug}`}
                      className="inline-flex items-center gap-1 text-[#0e254d] hover:text-[#081225] font-medium transition-colors group"
                    >
                      <span>Leer más</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Controles de navegación */}
          {news.length > 6 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#0e254d] text-gray-600 hover:text-[#0e254d] transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(news.length / 6) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === i ? 'bg-[#0e254d] scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#0e254d] text-gray-600 hover:text-[#0e254d] transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Botón ver todas las noticias */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/news'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0e254d] hover:bg-[#081225] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Ver Todas las Noticias</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;