import { useState } from 'react';
import type { CategoriaHilo, CreateHiloDto } from '../services/foroService';

interface CrearHiloFormProps {
  onSubmit: (data: CreateHiloDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const categorias: { value: CategoriaHilo; label: string; icon: string; description: string }[] = [
  { value: 'duda', label: 'Duda', icon: '❓', description: 'Tengo una pregunta sobre el servicio' },
  { value: 'queja', label: 'Queja', icon: '😤', description: 'Quiero reportar un problema' },
  { value: 'recomendacion', label: 'Recomendación', icon: '💡', description: 'Tengo una sugerencia de mejora' },
  { value: 'halago', label: 'Halago', icon: '⭐', description: 'Quiero felicitarlos por algo' },
];

export const CrearHiloForm = ({ onSubmit, onCancel, loading = false }: CrearHiloFormProps) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState<CategoriaHilo | ''>('');
  const [errors, setErrors] = useState<{ titulo?: string; contenido?: string; categoria?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!contenido.trim()) {
      newErrors.contenido = 'El contenido es obligatorio';
    } else if (contenido.trim().length < 5) {
      newErrors.contenido = 'El contenido debe tener al menos 5 caracteres';
    }

    if (!categoria) {
      newErrors.categoria = 'Debes seleccionar una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await onSubmit({
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        categoria: categoria as CategoriaHilo,
      });
      // Limpiar formulario después de éxito
      setTitulo('');
      setContenido('');
      setCategoria('');
    } catch (error) {
      // El error se maneja en el componente padre
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0e254d] to-[#1a3a6e] px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          Nueva Publicación
        </h3>
        <p className="text-blue-200 text-sm mt-1">Comparte tu opinión con nosotros</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ¿Qué tipo de publicación deseas hacer? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categorias.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategoria(cat.value);
                  setErrors(prev => ({ ...prev, categoria: undefined }));
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  categoria === cat.value
                    ? 'border-[#0e254d] bg-[#0e254d]/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span className={`font-semibold block ${categoria === cat.value ? 'text-[#0e254d]' : 'text-gray-700'}`}>
                  {cat.label}
                </span>
                <span className="text-xs text-gray-500 block mt-1">{cat.description}</span>
              </button>
            ))}
          </div>
          {errors.categoria && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.categoria}
            </p>
          )}
        </div>

        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              setErrors(prev => ({ ...prev, titulo: undefined }));
            }}
            placeholder="Escribe un título descriptivo..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0e254d]/20 ${
              errors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0e254d]'
            }`}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.titulo ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span>⚠️</span> {errors.titulo}
              </p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-400">{titulo.length}/100</span>
          </div>
        </div>

        {/* Contenido */}
        <div>
          <label htmlFor="contenido" className="block text-sm font-semibold text-gray-700 mb-2">
            Contenido <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => {
              setContenido(e.target.value);
              setErrors(prev => ({ ...prev, contenido: undefined }));
            }}
            placeholder="Describe tu duda, queja, recomendación o halago con detalle..."
            rows={5}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0e254d]/20 resize-none ${
              errors.contenido ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0e254d]'
            }`}
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            {errors.contenido ? (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span>⚠️</span> {errors.contenido}
              </p>
            ) : (
              <span></span>
            )}
            <span className="text-xs text-gray-400">{contenido.length}/2000</span>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm flex items-start gap-2">
            <span className="text-lg">ℹ️</span>
            <span>
              <strong>Nota:</strong> Una vez publicado, el contenido no podrá ser editado. 
              Asegúrate de revisar tu publicación antes de enviarla.
            </span>
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0e254d] to-[#1a3a6e] text-white font-semibold hover:from-[#0a1a3a] hover:to-[#152d5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Publicar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
