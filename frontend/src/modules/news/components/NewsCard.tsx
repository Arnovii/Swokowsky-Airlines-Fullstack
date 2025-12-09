import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react';
import type { Article } from '../services/newsService';

interface NewsCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
}

// Helper para formatear la fecha
const formatDate = (dateString?: string) => {
  if (!dateString) return new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper para formatear las vistas
const formatViews = (views?: number) => {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

export default function NewsCard({ article, onReadMore }: NewsCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-news-image.jpg';
          }}
        />
        
        {/* Badge de noticia */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-[#0e254d]">
            General
          </span>
        </div>
        
        {/* Badge de destacada (si aplica) */}
        {article.isFeatured && (
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
          {article.summary}
        </p>

        {/* Meta información */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>2 min</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{formatViews(0)}</span>
          </div>
        </div>

        {/* Autor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">S</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Swokowsky Airlines
            </span>
          </div>

          <button
            onClick={() => onReadMore(article)}
            className="inline-flex items-center gap-1 text-[#0e254d] hover:text-[#081225] font-medium transition-colors group"
          >
            <span>Leer más</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}