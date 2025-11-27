import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useHiloDetalle } from '../hooks/useForo';
import { CategoriaBadge } from '../components/CategoriaBadge';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeDate = (dateString: string): string => {
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
  
  return formatDate(dateString);
};

export const HiloDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hilo, loading, error, responderHilo, respondiendo, refetch } = useHiloDetalle(id!);
  
  const [respuesta, setRespuesta] = useState('');
  const [respuestaError, setRespuestaError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!respuesta.trim()) {
      setRespuestaError('La respuesta es obligatoria');
      return;
    }
    if (respuesta.trim().length < 5) {
      setRespuestaError('La respuesta debe tener al menos 5 caracteres');
      return;
    }

    try {
      await responderHilo(respuesta.trim());
      setRespuesta('');
      setRespuestaError('');
      setSuccessMessage('¡Tu respuesta ha sido publicada!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setRespuestaError('Error al publicar la respuesta. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0e254d] border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando publicación...</p>
      </div>
    );
  }

  if (error || !hilo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-md">
          <span className="text-6xl block mb-4">😕</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Publicación no encontrada'}
          </h2>
          <p className="text-gray-600 mb-6">
            No pudimos cargar esta publicación. Es posible que haya sido eliminada o que no tengas acceso.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="px-6 py-3 bg-[#0e254d] text-white rounded-xl font-semibold hover:bg-[#0a1a3a] transition-colors"
            >
              Reintentar
            </button>
            <Link
              to="/foro"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Volver al foro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0e254d] via-[#1a3a6e] to-[#0e254d] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/foro')}
            className="text-blue-200 hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mi Foro
          </button>
          <CategoriaBadge categoria={hilo.categoria} size="lg" />
          <h1 className="text-3xl font-bold mt-4">{hilo.titulo}</h1>
          <p className="text-blue-200 mt-2 flex items-center gap-2">
            <span>🕐</span>
            {formatDate(hilo.creado_en)}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
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

        {/* Contenido del hilo */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0e254d] to-[#1a3a6e] rounded-full flex items-center justify-center text-white text-xl">
                👤
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">Tú</span>
                  <span className="text-sm text-gray-500">• Autor</span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {hilo.contenido}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de respuestas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span>💬</span>
            Respuestas ({hilo.respuestas?.length || 0})
          </h2>

          {hilo.respuestas && hilo.respuestas.length > 0 ? (
            <div className="space-y-4">
              {hilo.respuestas.map((resp) => {
                const isAdmin = resp.autor?.tipo_usuario === 'admin' || resp.autor?.tipo_usuario === 'root';
                return (
                <div
                  key={resp.id_respuesta}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                      {isAdmin ? '👔' : '👤'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">
                          {isAdmin ? 'Swokowsky Airlines' : (resp.autor ? `${resp.autor.nombre} ${resp.autor.apellido}` : 'Usuario')}
                        </span>
                        {isAdmin && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                            ADMIN
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          • {formatRelativeDate(resp.creado_en)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {resp.contenido}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <span className="text-4xl block mb-3">💭</span>
              <p className="text-gray-600">
                Aún no hay respuestas en esta publicación.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Un representante de Swokowsky Airlines responderá pronto.
              </p>
            </div>
          )}
        </div>

        {/* Formulario de respuesta */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>✍️</span>
              Agregar una respuesta
            </h3>
          </div>
          <form onSubmit={handleResponder} className="p-6">
            <textarea
              value={respuesta}
              onChange={(e) => {
                setRespuesta(e.target.value);
                setRespuestaError('');
              }}
              placeholder="Escribe tu respuesta aquí..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0e254d]/20 resize-none ${
                respuestaError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0e254d]'
              }`}
              maxLength={2000}
            />
            <div className="flex justify-between mt-2 mb-4">
              {respuestaError ? (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠️</span> {respuestaError}
                </p>
              ) : (
                <span></span>
              )}
              <span className="text-xs text-gray-400">{respuesta.length}/2000</span>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={respondiendo}
                className="px-6 py-3 bg-gradient-to-r from-[#0e254d] to-[#1a3a6e] text-white rounded-xl font-semibold hover:from-[#0a1a3a] hover:to-[#152d5a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {respondiendo ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Enviar respuesta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HiloDetallePage;
