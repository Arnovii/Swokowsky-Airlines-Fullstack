import { Link } from 'react-router-dom';
import type { Hilo } from '../services/foroService';
import { CategoriaBadge } from './CategoriaBadge';

interface HiloCardProps {
  hilo: Hilo;
}

const formatExplicitDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const HiloCard = ({ hilo }: HiloCardProps) => {
  const respuestasCount = hilo._count?.respuestas ?? 0;

  return (
    <Link
      to={`/foro/${hilo.id_hilo}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-[#0e254d]/30 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <div className="p-5">
        {/* Header con categoría y fecha */}
        <div className="flex items-center justify-between mb-3">
          <CategoriaBadge categoria={hilo.categoria} />
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <span>🕐</span>
            {formatExplicitDate(hilo.creado_en)}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0e254d] transition-colors mb-2 line-clamp-2">
          {hilo.titulo}
        </h3>

        {/* Preview del contenido */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {hilo.contenido}
        </p>

        {/* Footer con estadísticas */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span>💬</span>
              <span className="font-medium">{respuestasCount}</span>
              <span>{respuestasCount === 1 ? 'respuesta' : 'respuestas'}</span>
            </span>
          </div>

          <span className="text-[#0e254d] text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};
