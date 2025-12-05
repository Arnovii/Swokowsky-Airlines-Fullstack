import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../../context/AuthContext';
import type { Conversacion, Mensaje } from '../services/chatService';

export default function ChatPage() {
  const { user } = useAuth();
  const isAdmin = user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'root';
  
  const {
    conversaciones,
    conversacionActual,
    loading,
    error,
    cargarConversacion,
    nuevaConversacion,
    enviar,
    cerrar,
    reabrir,
    setConversacionActual,
  } = useChat(isAdmin);

  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [nuevoAsunto, setNuevoAsunto] = useState('');
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajeInput, setMensajeInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacionActual?.mensajes]);

  // Crear nueva conversación
  const handleCrearConversacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAsunto.trim() || !nuevoMensaje.trim()) return;
    
    const result = await nuevaConversacion(nuevoAsunto, nuevoMensaje);
    if (result) {
      setMostrarNueva(false);
      setNuevoAsunto('');
      setNuevoMensaje('');
    }
  };

  // Enviar mensaje
  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeInput.trim() || !conversacionActual) return;
    
    setEnviando(true);
    await enviar(conversacionActual.id_conversacion, mensajeInput);
    setMensajeInput('');
    setEnviando(false);
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#123664] via-[#12699E] to-[#1785BC]">
            {isAdmin ? '📬 Bandeja de Soporte' : '💬 Chat de Soporte'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin 
              ? 'Gestiona las conversaciones de los usuarios'
              : 'Comunícate directamente con nuestro equipo de soporte'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de conversaciones */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#123664] to-[#1785BC] text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Conversaciones</h2>
                {!isAdmin && (
                  <button
                    onClick={() => setMostrarNueva(true)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  >
                    + Nueva
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {loading && conversaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-[#1785BC] border-t-transparent rounded-full mx-auto mb-2"></div>
                  Cargando...
                </div>
              ) : conversaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>No hay conversaciones</p>
                  {!isAdmin && (
                    <button
                      onClick={() => setMostrarNueva(true)}
                      className="mt-4 text-[#1785BC] font-medium hover:underline"
                    >
                      Iniciar una nueva conversación
                    </button>
                  )}
                </div>
              ) : (
                conversaciones.map((conv) => (
                  <ConversacionItem
                    key={conv.id_conversacion}
                    conversacion={conv}
                    isSelected={conversacionActual?.id_conversacion === conv.id_conversacion}
                    onClick={() => cargarConversacion(conv.id_conversacion)}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          </div>

          {/* Panel de chat */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
            {mostrarNueva ? (
              // Formulario nueva conversación
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#123664]">Nueva Conversación</h2>
                  <button
                    onClick={() => setMostrarNueva(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCrearConversacion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asunto
                    </label>
                    <input
                      type="text"
                      value={nuevoAsunto}
                      onChange={(e) => setNuevoAsunto(e.target.value)}
                      placeholder="Ej: Problema con mi reserva"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1785BC] focus:border-transparent transition-all"
                      required
                      minLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje
                    </label>
                    <textarea
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      placeholder="Describe tu consulta o problema..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1785BC] focus:border-transparent transition-all resize-none"
                      required
                      minLength={10}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#123664] to-[#1785BC] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Iniciar Conversación'}
                  </button>
                </form>
              </div>
            ) : conversacionActual ? (
              // Chat activo
              <>
                {/* Header del chat */}
                <div className="p-4 bg-gradient-to-r from-[#123664] to-[#1785BC] text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg">{conversacionActual.asunto}</h2>
                      <p className="text-sm text-white/80">
                        {isAdmin && `De: ${conversacionActual.usuario.nombre} ${conversacionActual.usuario.apellido}`}
                        {!isAdmin && 'Conversación con Soporte'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        conversacionActual.estado === 'abierto'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {conversacionActual.estado === 'abierto' ? '🟢 Abierto' : '⚫ Cerrado'}
                      </span>
                      {isAdmin && (
                        conversacionActual.estado === 'abierto' ? (
                          <button
                            onClick={() => cerrar(conversacionActual.id_conversacion)}
                            className="bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                          >
                            Cerrar
                          </button>
                        ) : (
                          <button
                            onClick={() => reabrir(conversacionActual.id_conversacion)}
                            className="bg-green-500/80 hover:bg-green-500 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                          >
                            Reabrir
                          </button>
                        )
                      )}
                      <button
                        onClick={() => setConversacionActual(null)}
                        className="lg:hidden bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {conversacionActual.mensajes.map((mensaje) => (
                    <MensajeBurbuja
                      key={mensaje.id_mensaje}
                      mensaje={mensaje}
                      isOwn={mensaje.id_autorFK === user?.id_usuario}
                      formatFecha={formatFecha}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de mensaje */}
                {conversacionActual.estado === 'abierto' ? (
                  <form onSubmit={handleEnviarMensaje} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={mensajeInput}
                        onChange={(e) => setMensajeInput(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1785BC] focus:border-transparent transition-all"
                        disabled={enviando}
                      />
                      <button
                        type="submit"
                        disabled={enviando || !mensajeInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-[#123664] to-[#1785BC] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {enviando ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-gray-100 text-center text-gray-500 border-t">
                    Esta conversación está cerrada
                  </div>
                )}
              </>
            ) : (
              // Sin conversación seleccionada
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium">Selecciona una conversación</p>
                  <p className="text-sm">o inicia una nueva</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para item de conversación
function ConversacionItem({
  conversacion,
  isSelected,
  onClick,
  isAdmin,
}: {
  conversacion: Conversacion;
  isSelected: boolean;
  onClick: () => void;
  isAdmin: boolean;
}) {
  const ultimoMensaje = conversacion.mensajes[0];
  const noLeidos = conversacion._count?.mensajes || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-blue-50 transition-all ${
        isSelected ? 'bg-blue-100 border-l-4 border-[#1785BC]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{conversacion.asunto}</h3>
            {conversacion.estado === 'cerrado' && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                Cerrado
              </span>
            )}
          </div>
          {isAdmin && (
            <p className="text-sm text-[#1785BC] font-medium">
              {conversacion.usuario.nombre} {conversacion.usuario.apellido}
            </p>
          )}
          {ultimoMensaje && (
            <p className="text-sm text-gray-500 truncate mt-1">
              {ultimoMensaje.autor.tipo_usuario === 'admin' || ultimoMensaje.autor.tipo_usuario === 'root'
                ? '👤 Soporte: '
                : ''}
              {ultimoMensaje.contenido}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-400">
            {new Date(conversacion.actualizado_en).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
          {noLeidos > 0 && (
            <span className="w-5 h-5 bg-[#1785BC] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {noLeidos}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Componente para burbuja de mensaje
function MensajeBurbuja({
  mensaje,
  isOwn,
  formatFecha,
}: {
  mensaje: Mensaje;
  isOwn: boolean;
  formatFecha: (fecha: string) => string;
}) {
  const esAdmin = mensaje.autor.tipo_usuario === 'admin' || mensaje.autor.tipo_usuario === 'root';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-[#123664] to-[#1785BC] text-white rounded-br-md'
              : esAdmin
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-bl-md'
              : 'bg-white text-gray-800 shadow-md rounded-bl-md'
          }`}
        >
          {!isOwn && (
            <p className={`text-xs font-semibold mb-1 ${esAdmin ? 'text-emerald-100' : 'text-[#1785BC]'}`}>
              {esAdmin ? '👤 Soporte' : mensaje.autor.nombre}
            </p>
          )}
          <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatFecha(mensaje.creado_en)}
        </p>
      </div>
    </div>
  );
}
