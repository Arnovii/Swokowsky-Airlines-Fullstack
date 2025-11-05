import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import FlightCheckoutCard from '../components/FlightCheckoutCard';
import TravelerForm from '../components/TravelerForm';
import CheckoutSummary from '../components/CheckoutSummary';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import WalletBalance from '../components/WalletBalance';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { usePaymentProcess } from '../hooks/usePaymentProcess';
import { toast } from 'react-toastify';
import { useWalletBalance } from '../hooks/useWalletBalance';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const { saldo } = useWalletBalance();
  
  const [expandedFlightIndex, setExpandedFlightIndex] = useState<number | null>(0);

  const {
    updateTravelerInfo,
    allFormsComplete,
    getCompletedCount,
    getCheckoutData,
    totalForms,
    isReadyForCheckout,
    travelers // <-- Cambiado aquí
  } = useCheckoutForm(cart);

  const {
    isProcessing,
    paymentResult,
    showModal,
    processPayment,
    closeModal
  } = usePaymentProcess();

  // Calcular total con descuentos de promociones
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => {
      const tarifa = item.vuelo?.tarifas?.find((t: { clase: string }) => t.clase === item.clase);
      const precioUnitario = tarifa?.precio_base || 0;
      const descuento = item.vuelo?.promocion?.descuento || 0;
      const precioConDescuento = precioUnitario * (1 - descuento);
      return total + (precioConDescuento * item.cantidad_de_tickets);
    }, 0);
  }, [cart]);

  // Verificar si un vuelo específico está completo
  const isFlightComplete = (cartItemId: number, ticketCount: number): boolean => {
    if (!travelers || Object.keys(travelers).length === 0) {
      return false;
    }

    for (let i = 0; i < ticketCount; i++) {
      const formKey = `${cartItemId}-${i}`;
      const travelerData = travelers[formKey];
      
      if (!travelerData?.numero_documento || 
          !travelerData?.primer_nombre || 
          !travelerData?.primer_apellido || 
          !travelerData?.fecha_nacimiento || 
          !travelerData?.genero || 
          !travelerData?.email) {
        return false;
      }
    }
    return true;
  };

  // Redirigir si el carrito está vacío
  useEffect(() => {
    // Solo redirigir si terminó de cargar Y está vacío
    // Agregamos un pequeño delay para evitar falsos positivos
    if (!cartLoading && cart.length === 0) {
      const timer = setTimeout(() => {
        toast.info('Tu carrito está vacío', { position: 'top-center' });
        navigate('/carrito');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [cart.length, cartLoading, navigate]);

  // Verificar si es administrador
  useEffect(() => {
    if (!user) return;
    
    const isAdmin = user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'root';
    if (isAdmin) {
      toast.error('Los administradores no pueden realizar reservas');
      navigate('/');
    }
  }, [user, navigate]);

  // Handler para expandir/colapsar vuelo
  const handleExpandFlight = (index: number) => {
    setExpandedFlightIndex(expandedFlightIndex === index ? null : index);
  };

  // Handler para proceder al pago
  const handleProceedToPayment = async () => {
    // Validar saldo suficiente
    const userBalance = saldo || 0;
    if (userBalance < totalAmount) {
      toast.error('❌ Saldo insuficiente. Por favor recarga tu billetera.', {
        position: 'top-center',
        autoClose: 5000
      });
      return;
    }

    // Validar formularios completos
    if (!allFormsComplete) {
      toast.warning('⚠️ Por favor completa la información de todos los pasajeros', {
        position: 'top-center',
        autoClose: 4000
      });
      
      // Encontrar el primer vuelo incompleto y expandirlo
      const firstIncompleteIndex = cart.findIndex((item) => 
        !isFlightComplete(item.id_item_carrito, item.cantidad_de_tickets)
      );
      
      if (firstIncompleteIndex !== -1) {
        setExpandedFlightIndex(firstIncompleteIndex);
      }
      
      return;
    }

    // Validar que el payload esté listo
    if (!isReadyForCheckout()) {
      toast.error('⚠️ Hay errores en la información de los pasajeros. Por favor revisa los formularios.', {
        position: 'top-center',
        autoClose: 5000
      });
      return;
    }

    try {
      console.log('🔄 Iniciando proceso de pago...');
      console.log('📊 Estado de travelers:', travelers);
      console.log('🛒 Items del carrito:', cart);
      
      // Obtener datos de checkout en el formato correcto
      const checkoutPayload = getCheckoutData();
      
      console.log('📦 Payload generado:', JSON.stringify(checkoutPayload, null, 2));
      
      // Verificar que cada item tenga pasajeros
      Object.keys(checkoutPayload).forEach(key => {
        const item = checkoutPayload[key as keyof typeof checkoutPayload];
        console.log(`✈️ ${key}:`, {
          vueloID: item.vueloID,
          Clase: item.Clase,
          CantidadDePasajeros: item.CantidadDePasajeros,
          pasajeros: item.pasajeros.length,
          primerPasajero: item.pasajeros[0]
        });
      });

      // Procesar pago
      const result = await processPayment(checkoutPayload);

      // Si el pago fue exitoso, limpiar carrito y redirigir
      if (result.success) {
        console.log('✅ Pago exitoso, limpiando carrito...');
        
        // Esperar 1 segundo antes de redirigir (tiempo para ver el modal)
        setTimeout(async () => {
          await clearCart();
          navigate('/');
        }, 5000);
      }

    } catch (error) {
      console.error('❌ Error en handleProceedToPayment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago. Por favor intenta nuevamente.';
      toast.error(
        errorMessage,
        { position: 'top-center', autoClose: 5000 }
      );
    }
  };

  // Handler para cerrar modal
  const handleModalClose = () => {
    closeModal();
    
    // Si el pago fue exitoso, redirigir inmediatamente al home
    if (paymentResult?.success) {
      clearCart();
      navigate('/');
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#39A5D8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A5D8] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-[#123361] mb-2">Cargando checkout</h3>
          <p className="text-gray-600">Preparando tu información...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cartLoading && cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/carrito')}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-xl border border-[#39A5D8]/20 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#39A5D8]/30 hover:scale-105 mb-6"
          >
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-lg">Volver al Carrito</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-full mb-4 shadow-xl shadow-[#39A5D8]/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent mb-3">
              FINALIZAR COMPRA
            </h1>
            <p className="text-[#123361]/80 text-lg font-medium">
              Completa la información de los pasajeros para confirmar tu reserva
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formularios de pasajeros */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Balance */}
            <WalletBalance
              totalAmount={totalAmount}
            />

            {/* Sección de pasajeros */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent">
                    INFORMACIÓN DE PASAJEROS
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">
                    {getCompletedCount()} de {totalForms} pasajeros completados
                  </p>
                </div>
              </div>

              {/* Vuelos y formularios */}
              {cart.map((item, flightIndex) => {
                const isExpanded = expandedFlightIndex === flightIndex;
                const isComplete = travelers ? isFlightComplete(item.id_item_carrito, item.cantidad_de_tickets) : false;

                return (
                  <div key={item.id_item_carrito} className="space-y-4">
                    <FlightCheckoutCard
                      cartItem={item}
                      isComplete={isComplete}
                      onEditClick={() => handleExpandFlight(flightIndex)}
                    />

                    {isExpanded && (
                      <div className="animate-fade-in space-y-4 pl-4 border-l-4 border-[#39A5D8]/30 bg-gradient-to-br from-blue-50/50 to-transparent rounded-r-2xl py-4 pr-4">
                        <div className="mb-4 px-4 py-3 bg-gradient-to-r from-[#39A5D8]/10 to-[#1180B8]/5 rounded-xl border-l-4 border-[#39A5D8]">
                          <p className="text-base font-bold text-[#123361] flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Complete los datos de {item.cantidad_de_tickets} {item.cantidad_de_tickets === 1 ? 'pasajero' : 'pasajeros'}
                          </p>
                        </div>
                        {travelers ? (
                          Array.from({ length: item.cantidad_de_tickets }).map((_, passengerIndex) => {
                            const formKey = `${item.id_item_carrito}-${passengerIndex}`;
                            const initialData = travelers[formKey] || {};

                            return (
                              <TravelerForm
                                key={formKey}
                                index={passengerIndex + 1}
                                initialData={initialData}
                                onUpdate={(data) => updateTravelerInfo(formKey, data)}
                              />
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A5D8] mx-auto mb-2"></div>
                            <p className="text-gray-600 text-sm">Cargando formularios...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              cart={cart}
              totalAmount={totalAmount}
              isProcessing={isProcessing}
              allFormsComplete={allFormsComplete}
              onPayment={handleProceedToPayment}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && paymentResult && (
        <PaymentConfirmationModal
          success={paymentResult.success}
          message={paymentResult.message}
          transactionId={paymentResult.transactionId}
          onClose={handleModalClose}
        />
      )}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
z
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;