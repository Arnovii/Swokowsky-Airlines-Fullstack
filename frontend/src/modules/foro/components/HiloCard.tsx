import { Link } from 'react-router-dom';
import type { Hilo } from '../services/foroService';
import { CategoriaBadge } from './CategoriaBadge';

interface HiloCardProps {
  hilo: Hilo;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
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
            {formatDate(hilo.creado_en)}
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
