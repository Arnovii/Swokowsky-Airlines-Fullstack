import React from 'react';
import { X } from 'lucide-react';

interface ClassSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClass: (clase: 'economica' | 'primera_clase') => void;
  flightInfo?: {
    origen: string;
    destino: string;
    precio: number;
  };
}

export const ClassSelectorModal: React.FC<ClassSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectClass,
  flightInfo,
}) => {
  if (!isOpen) return null;

  const handleSelect = (clase: 'economica' | 'primera_clase') => {
    onSelectClass(clase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F6899] to-[#39A5D8] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-2">Selecciona la clase de vuelo</h2>
          {flightInfo && (
            <p className="text-white/90 text-sm">
              {flightInfo.origen} → {flightInfo.destino}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Clase Económica */}
          <button
            onClick={() => handleSelect('economica')}
            className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-[#081225]">Clase Económica</h3>
                    <p className="text-sm text-gray-600">Precio estándar</p>
                  </div>
                </div>
              </div>
              <ul className="text-left space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Equipaje de mano incluido</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Selección de asiento estándar</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Entretenimiento a bordo</span>
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          </button>

          {/* Primera Clase */}
          <button
            onClick={() => handleSelect('primera_clase')}
            className="w-full group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 border-2 border-amber-300 hover:border-amber-500 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-[#081225]">Primera Clase</h3>
                    <p className="text-sm text-gray-600">Experiencia premium</p>
                  </div>
                </div>
                <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  VIP
                </span>
              </div>
              <ul className="text-left space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Asientos espaciosos y reclinables</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Comida gourmet y bebidas premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Acceso a sala VIP</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Prioridad en embarque y equipaje</span>
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          </button>

          <button
            onClick={onClose}
            className="w-full mt-4 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};