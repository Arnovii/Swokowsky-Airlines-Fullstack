import React from 'react';
import type { CartItem } from '../../carrito/service/cartService';

interface CheckoutSummaryProps {
  cart: CartItem[];
  totalAmount: number;
  isProcessing: boolean;
  allFormsComplete: boolean;
  onPayment: () => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cart,
  totalAmount,
  isProcessing,
  allFormsComplete,
  onPayment
}) => {
  // Calcular total de pasajeros
  const totalPassengers = cart.reduce((sum, item) => sum + item.cantidad_de_tickets, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 sticky top-4">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#123361]">Resumen de Compra</h3>
            <p className="text-sm text-gray-600">
              {cart.length} {cart.length === 1 ? 'vuelo' : 'vuelos'} · {totalPassengers} {totalPassengers === 1 ? 'pasajero' : 'pasajeros'}
            </p>
          </div>
        </div>

        {/* Detalles por vuelo */}
        <div className="space-y-3 mb-4">
          {cart.map((item, index) => {
            const tarifa = item.vuelo?.tarifas?.find((t: any) => t.clase === item.clase);
            const precioUnitario = tarifa?.precio_base || 0;
            const descuento = item.vuelo?.promocion?.descuento ?? 0;
            const precioFinal = descuento > 0
              ? Math.round(precioUnitario * (1 - descuento))
              : precioUnitario;
            const subtotal = precioFinal * item.cantidad_de_tickets;

            return (
              <div key={item.id_item_carrito} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#123361]">
                      Vuelo {index + 1}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.vuelo?.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.codigo_iata || 'N/A'} →{' '}
                      {item.vuelo?.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.codigo_iata || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.clase} · {item.cantidad_de_tickets} {item.cantidad_de_tickets === 1 ? 'pasajero' : 'pasajeros'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#123361]">
                      ${subtotal.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${precioFinal.toLocaleString('es-CO')} c/u
                    </p>
                    <p className="text-xs text-green-600 font-bold">
                      {descuento > 0 ? `-${(descuento * 100).toFixed(0)}% promoción` : 'Sin promoción'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent">
              ${totalAmount.toLocaleString('es-CO')}
            </span>
          </div>

          {/* Botón de pago */}
          <button
            onClick={onPayment}
            disabled={!allFormsComplete || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
              allFormsComplete && !isProcessing
                ? 'bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] hover:scale-105 hover:shadow-xl hover:shadow-[#39A5D8]/30 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando pago...
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

          {!allFormsComplete && !isProcessing && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-center text-sm text-yellow-800 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Completa la información de todos los pasajeros</span>
              </p>
            </div>
          )}
        </div>

        {/* Nota de seguridad */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-[#1180B8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#123361] mb-1">
                Pago seguro con tu billetera
              </p>
              <p className="text-xs text-gray-600">
                El monto será descontado de tu saldo disponible de forma segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;