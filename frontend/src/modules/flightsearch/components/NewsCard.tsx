import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  image: string;
  type: 'promotion' | 'flight_schedule';
  route: string;
  price?: string;
  discount?: string;
  validUntil?: string;
  frequency?: string;
  duration?: string;
}

interface NewsCardProps {
  news: NewsItem;
  onViewDetail: (news: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onViewDetail }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            news.type === 'promotion' ? 'bg-red-500' : 'bg-brand-darkblue'
          }`}>
            {news.type === 'promotion' ? 'PROMOCIÓN' : 'PROGRAMACIÓN'}
          </span>
        </div>
        {news.type === 'promotion' && news.discount && (
          <div className="absolute top-4 right-4 bg-brand-cyan text-white px-2 py-1 rounded text-sm font-bold">
            {news.discount}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(news.date)}
          <MapPin className="w-4 h-4 ml-4 mr-1" />
          {news.route}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans line-clamp-2">
          {news.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {news.summary}
        </p>
        
        {news.type === 'promotion' && news.price && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-brand-cyan font-bold text-lg">{news.price}</span>
            <span className="text-sm text-gray-500">Válido hasta {formatDate(news.validUntil!)}</span>
          </div>
        )}
        
        {news.type === 'flight_schedule' && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span className="mr-4">{news.frequency}</span>
            <span>{news.duration}</span>
          </div>
        )}
        
        <button
          onClick={() => onViewDetail(news)}
          className="w-full bg-brand-darkblue hover:bg-[#0e254d] text-white py-2 px-4 rounded-lg transition-colors duration-200 font-bold"
        >
          Ver Detalle
        </button>
      </div>
    </div>
  );
};