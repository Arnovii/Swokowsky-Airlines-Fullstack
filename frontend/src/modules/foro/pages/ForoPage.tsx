import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForo } from '../hooks/useForo';
import { HiloCard } from '../components/HiloCard';
import { CrearHiloForm } from '../components/CrearHiloForm';
import type { CategoriaHilo } from '../services/foroService';

export const ForoPage = () => {
  const { hilos, loading, error, crearHilo, creatingHilo, refetch } = useForo();
  const [showCrearForm, setShowCrearForm] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaHilo | 'todas'>('todas');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCrearHilo = async (data: Parameters<typeof crearHilo>[0]) => {
    await crearHilo(data);
    setShowCrearForm(false);
    setSuccessMessage('¡Tu publicación ha sido creada exitosamente!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const hilosFiltrados = filtroCategoria === 'todas' 
    ? hilos 
    : hilos.filter(h => h.categoria === filtroCategoria);

  const categoriasFiltro: { value: CategoriaHilo | 'todas'; label: string; icon: string }[] = [
    { value: 'todas', label: 'Todas', icon: '📋' },
    { value: 'duda', label: 'Dudas', icon: '❓' },
    { value: 'queja', label: 'Quejas', icon: '😤' },
    { value: 'recomendacion', label: 'Recomendaciones', icon: '💡' },
    { value: 'halago', label: 'Halagos', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0e254d] via-[#1a3a6e] to-[#0e254d] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/perfil" className="text-blue-200 hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Mi Perfil
            </Link>
          </div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span className="text-5xl">💬</span>
            Mi Foro
          </h1>
          <p className="text-blue-200 mt-2 text-lg">
            Comparte tus dudas, quejas, recomendaciones y halagos con nosotros
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl">✅</span>
            <span className="text-green-800 font-medium">{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <span className="text-red-800">{error}</span>
            <button 
              onClick={refetch}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Botón para mostrar formulario */}
        {!showCrearForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowCrearForm(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#0e254d] to-[#1a3a6e] text-white rounded-xl font-semibold hover:from-[#0a1a3a] hover:to-[#152d5a] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">✍️</span>
              <span>Nueva Publicación</span>
            </button>
          </div>
        )}

        {/* Formulario de crear hilo */}
        {showCrearForm && (
          <div className="mb-8 animate-fade-in">
            <CrearHiloForm
              onSubmit={handleCrearHilo}
              onCancel={() => setShowCrearForm(false)}
              loading={creatingHilo}
            />
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Filtrar por:</span>
            {categoriasFiltro.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFiltroCategoria(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  filtroCategoria === cat.value
                    ? 'bg-[#0e254d] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de hilos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0e254d] border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando tus publicaciones...</p>
          </div>
        ) : hilosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">
              {filtroCategoria === 'todas' ? '📭' : categoriasFiltro.find(c => c.value === filtroCategoria)?.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filtroCategoria === 'todas' 
                ? 'Aún no tienes publicaciones'
                : `No tienes publicaciones de tipo "${categoriasFiltro.find(c => c.value === filtroCategoria)?.label}"`
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {filtroCategoria === 'todas'
                ? 'Comparte tu primera duda, queja, recomendación o halago con nosotros'
                : 'Intenta con otro filtro o crea una nueva publicación'
              }
            </p>
            {filtroCategoria === 'todas' && !showCrearForm && (
              <button
                onClick={() => setShowCrearForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#0e254d] to-[#1a3a6e] text-white rounded-xl font-semibold hover:from-[#0a1a3a] hover:to-[#152d5a] transition-all inline-flex items-center gap-2"
              >
                <span>✍️</span>
                <span>Crear mi primera publicación</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {hilosFiltrados.length} {hilosFiltrados.length === 1 ? 'publicación' : 'publicaciones'}
              </h2>
            </div>
            {hilosFiltrados.map((hilo) => (
              <HiloCard key={hilo.id_hilo} hilo={hilo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForoPage;
