import { useEffect, useState } from 'react';

interface PaymentConfirmationModalProps {
  success: boolean;
  message: string;
  transactionId?: string;
  onClose: () => void;
  onViewTickets?: () => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  success,
  message,
  transactionId,
  onClose,
  onViewTickets
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setIsVisible(true);
    
    // Confetti si es exitoso
    if (success) {
      setTimeout(() => setShowConfetti(true), 200);
    }
  }, [success]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Confetti effect para éxito */}
      {success && showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 ${
        isVisible ? 'scale-100 translate-y-0 rotate-0' : 'scale-75 translate-y-8 rotate-3'
      }`}>
        {/* Banda decorativa superior */}
        <div className={`h-2 rounded-t-3xl ${
          success 
            ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' 
            : 'bg-gradient-to-r from-red-400 via-rose-500 to-red-600'
        }`} />

        <div className="p-8">
          {/* Icono animado mejorado */}
          <div className="flex justify-center mb-6">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
              success 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-200' 
                : 'bg-gradient-to-br from-red-100 to-rose-100 shadow-lg shadow-red-200'
            } ${isVisible ? 'animate-scale-in' : ''}`}>
              {/* Círculo pulsante de fondo */}
              <div className={`absolute inset-0 rounded-full ${
                success ? 'bg-green-400' : 'bg-red-400'
              } animate-ping opacity-20`} />
              
              {success ? (
                <svg 
                  className="w-14 h-14 text-green-600 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ animation: 'checkmark 0.6s ease-in-out 0.3s forwards' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg 
                  className="w-14 h-14 text-red-600 relative z-10 animate-shake" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>

          {/* Título con gradiente */}
          <h3 className={`text-3xl font-bold text-center mb-4 ${
            success 
              ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent'
          }`}>
            {success ? '¡Pago Exitoso!' : 'Pago Rechazado'}
          </h3>

          {/* Mensaje */}
          <p className="text-gray-700 text-center mb-6 text-lg leading-relaxed">
            {message}
          </p>

          {/* ID de transacción mejorado */}
          {success && transactionId && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 border-2 border-gray-200 shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-[#123361]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-semibold text-[#123361] uppercase tracking-wider">
                  ID de Transacción
                </p>
              </div>
              <p className="text-base font-mono font-bold bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent text-center break-all">
                {transactionId}
              </p>
            </div>
          )}

          {/* Información adicional mejorada */}
          <div className={`rounded-2xl p-5 mb-6 border-2 ${
            success 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm shadow-green-100' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-sm shadow-red-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  success ? 'text-green-600' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-sm leading-relaxed ${
                success ? 'text-green-800' : 'text-red-800'
              }`}>
                {success 
                  ? 'Tu reserva ha sido confirmada exitosamente. Recibirás un correo electrónico con los detalles de tu vuelo y el boarding pass.'
                  : 'No se pudo procesar tu pago. Por favor verifica tu saldo en la billetera e intenta nuevamente.'
                }
              </p>
            </div>
          </div>

          {/* Botones mejorados */}
          <div className="flex gap-3">
            {success ? (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    if (onViewTickets) {
                      onViewTickets();
                    } else {
                      onClose();
                    }
                  }, 300);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-[#39A5D8]/30 transition-all duration-300 transform hover:scale-105"
              >
                Ver Tickets
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-[#39A5D8]/30 transition-all duration-300 transform hover:scale-105"
              >
                Intentar Nuevamente
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 100;
          }
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti linear infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default PaymentConfirmationModal;