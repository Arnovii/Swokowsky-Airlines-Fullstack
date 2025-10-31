
import { useEffect, useState } from 'react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  transactionId?: string;
  onClose: () => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  isSuccess,
  message,
  transactionId,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="p-8">
          {/* Icono animado */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isSuccess ? (
                <svg className="w-12 h-12 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className={`text-2xl font-bold text-center mb-3 ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {isSuccess ? '¡Pago Exitoso!' : 'Pago Rechazado'}
          </h3>

          {/* Mensaje */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* ID de transacción */}
          {isSuccess && transactionId && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1 text-center">ID de Transacción</p>
              <p className="text-sm font-mono font-semibold text-gray-800 text-center break-all">
                {transactionId}
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className={`rounded-xl p-4 mb-6 border ${
            isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-sm ${
                isSuccess ? 'text-green-700' : 'text-red-700'
              }`}>
                {isSuccess 
                  ? 'Tu reserva ha sido confirmada. Recibirás un correo con los detalles de tu vuelo.'
                  : 'Por favor verifica tu saldo o método de pago e intenta nuevamente.'
                }
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            {isSuccess ? (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border-2 border-[#0F6899] text-[#0F6899] rounded-xl font-semibold hover:bg-[#0F6899]/10 transition-colors duration-200"
                >
                  Ver Mis Reservas
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Entendido
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Intentar Nuevamente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;