import type { CategoriaHilo } from '../services/foroService';

interface CategoriaBadgeProps {
  categoria: CategoriaHilo;
  size?: 'sm' | 'md' | 'lg';
}

const categoriaConfig: Record<CategoriaHilo, { label: string; color: string; icon: string }> = {
  queja: {
    label: 'Queja',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '😤',
  },
  duda: {
    label: 'Duda',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '❓',
  },
  recomendacion: {
    label: 'Recomendación',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '💡',
  },
  halago: {
    label: 'Halago',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '⭐',
  },
};

export const CategoriaBadge = ({ categoria, size = 'md' }: CategoriaBadgeProps) => {
  const config = categoriaConfig[categoria] || categoriaConfig.duda;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export const getCategoriaLabel = (categoria: CategoriaHilo): string => {
  return categoriaConfig[categoria]?.label || categoria;
};

export const getCategoriaIcon = (categoria: CategoriaHilo): string => {
  return categoriaConfig[categoria]?.icon || '📝';
};
