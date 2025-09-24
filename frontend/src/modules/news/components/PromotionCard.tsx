
import React from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';
import type { Promotion } from '../hooks/usePromotions';
import { Link } from "react-router-dom"

interface PromotionCardProps {
  promotion: Promotion;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Imagen con badge de descuento */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <img
          src={promotion.image}
          alt={promotion.destination}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen no carga
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg shadow-lg">
          -{promotion.discount}%
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-red-500" />
            <span className="text-xs font-bold text-gray-800">OFERTA</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título y destino */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#081225] mb-2 font-sans line-clamp-2">
            {promotion.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            <span className="text-sm font-sans">{promotion.destination}</span>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 font-sans line-clamp-2">
          {promotion.description}
        </p>

        {/* Precios */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-500 line-through font-sans">
              {formatPrice(promotion.originalPrice)}
            </span>
            <span className="text-2xl font-bold text-green-600 font-sans">
              {formatPrice(promotion.discountedPrice)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 font-sans">
            Ahorras {formatPrice(promotion.originalPrice - promotion.discountedPrice)}
          </div>
        </div>

        {/* Fecha de validez */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar size={14} />
          <span className="font-sans">Válido hasta: {formatDate(promotion.validUntil)}</span>
        </div>

        <Link
          to={`/noticias/oferta/${promotion.id}`} // usa el id real de la oferta
          className="inline-block bg-[#0e254d] text-white px-4 py-2 rounded font-sans hover:bg-[#0a1a3a] transition-colors w-full text-center"
        >
          Reservar Ahora
        </Link>
      </div>
    </div>
  );
};

export default PromotionCard;