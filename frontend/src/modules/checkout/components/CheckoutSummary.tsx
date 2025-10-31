
interface CheckoutSummaryProps {
  totalAmount: number;
  itemCount: number;
  completedCount: number;
  onProceedToPayment: () => void;
  isProcessing: boolean;
  canProceed: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  totalAmount,
  itemCount,
  completedCount,
  onProceedToPayment,
  isProcessing,
  canProceed
}) => {
  const allComplete = completedCount === itemCount;
  const progressPercentage = itemCount > 0 ? (completedCount / itemCount) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 sticky top-4">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0F6899]">Resumen de Compra</h3>
            <p className="text-sm text-gray-600">{itemCount} {itemCount === 1 ? 'vuelo' : 'vuelos'}</p>
          </div>
        </div>

      

        {/* Detalles de precio */}
        <div className="space-y-3 py-4 border-t border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">
              ${totalAmount.toLocaleString('es-CO')}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Impuestos y cargos</span>
            <span className="font-semibold text-gray-800">Incluidos</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 pt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
            <span className="text-2xl font-bold text-[#0F6899]">
              ${totalAmount.toLocaleString('es-CO')}
            </span>
          </div>

          {/* Botón de pago */}
          <button
            onClick={onProceedToPayment}
            disabled={!canProceed || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
              canProceed && !isProcessing
                ? 'bg-gradient-to-r from-[#0F6899] to-[#39A5D8] hover:scale-105 hover:shadow-xl cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Proceder al Pago
              </span>
            )}
          </button>

          {!canProceed && !isProcessing && (
            <p className="text-center text-sm text-red-600 mt-3 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completa todos los formularios para continuar
            </p>
          )}
        </div>

        {/* Nota de seguridad */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Pago seguro
              </p>
              <p className="text-xs text-blue-700">
                Tu información está protegida con encriptación de última generación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;