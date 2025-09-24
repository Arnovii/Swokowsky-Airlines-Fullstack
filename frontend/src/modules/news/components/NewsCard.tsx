
import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Article } from '../services/newsService';

interface NewsCardProps {
  article: Article;
  onReadMore: (article: Article) => void;
}

// Helper para formatear la fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper para truncar el texto
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function NewsCard({ article, onReadMore }: NewsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col">
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-800">
        <img 
          className="h-full w-full object-cover" 
          src={article.imageUrl} 
          alt={article.title}
          onError={(e) => {
            // Fallback si la imagen no carga - mantener el gradiente de fondo
            e.currentTarget.style.opacity = '0';
          }}
        />
        
        {/* Badge de noticia */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-800 font-sans">NOTICIA</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Fecha */}
        <div className="flex items-center gap-2 text-gray-500 mb-3">
          <Calendar size={14} />
          <span className="text-sm font-sans">{formatDate(article.publishDate)}</span>
        </div>

        {/* Título */}
        <h3 className="font-bold text-xl mb-3 text-[#081225] font-sans leading-tight">
          {article.title}
        </h3>

        {/* Resumen */}
        <p className="text-gray-600 text-base mb-6 flex-grow font-sans leading-relaxed">
          {truncateText(article.summary, 140)}
        </p>

        {/* Botón */}
        <button 
          onClick={() => onReadMore(article)}
          className="group mt-auto w-full bg-gradient-to-r from-[#081225] to-[#1a2332] text-white font-bold py-3 px-4 rounded-lg hover:from-[#1a2332] hover:to-[#081225] transition-all duration-200 font-sans shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Ver detalle
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}