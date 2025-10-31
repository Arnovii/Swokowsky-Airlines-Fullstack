
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import FlightCheckoutCard from '../components/FlightCheckoutCard';
import TravelerForm from '../components/TravelerForm';
import CheckoutSummary from '../components/CheckoutSummary';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { usePaymentProcess } from '../hooks/usePaymentProcess';
import WalletBalance from '../components/WalletBalance';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const [expandedFlightIndex, setExpandedFlightIndex] = useState<number | null>(0);
  
  // Simular saldo del usuario (reemplazar con datos reales de la API)
  const [userBalance] = useState(2500000);

  // Hook personalizado para manejar formularios
  const {
    flightCheckoutData,
    updateTravelerInfo,
    allFormsComplete,
    getCompletedCount,
    getCheckoutData,
    totalForms
  } = useCheckoutForm(cart);

  // Hook personalizado para procesar pago
  const {
    isProcessing,
    paymentResult,
    showModal,
    processPayment,
    closeModal,
    resetPayment
  } = usePaymentProcess();

  // Calcular total
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => {
      const flight = item.vuelo;
      const tarifa = flight.tarifa?.find(t => t.clase === item.clase);
      const precioUnitario = tarifa?.precio_base || 0;
      return total + (precioUnitario * item.cantidad_de_tickets);
    }, 0);
  }, [cart]);

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (!cartLoading && cart.length === 0) {
      navigate('/carrito');
    }
  }, [cart.length, cartLoading, navigate]);

  useEffect(() => {
    if (!cartLoading && cart.length > 0) {
      console.log("Estructura del carrito:", cart);
      console.log("Primer vuelo:", cart[0].vuelo);
    }
  }, [cart, cartLoading]);

  // Verificar si es administrador
  useEffect(() => {
    const isAdmin = user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'root';
    if (isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleExpandFlight = (index: number) => {
    setExpandedFlightIndex(expandedFlightIndex === index ? null : index);
  };

  const handleProceedToPayment = async () => {
    if (!allFormsComplete()) {
      return;
    }

    const checkoutData = getCheckoutData();
    const result = await processPayment(checkoutData, totalAmount);

    if (result.success) {
      // Limpiar carrito después de pago exitoso (opcional)
      // await clearCart();
      
      // Navegar al perfil después de 3 segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 3000);
    }
  };

  const handleModalClose = () => {
    closeModal();
    if (paymentResult?.success) {
      navigate('/perfil');
    }
  };

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

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
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

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saldo del monedero */}
            <WalletBalance 
              totalAmount={totalAmount}
            />

            {/* Lista de vuelos con formularios */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-xl flex items-center justify-center shadow-lg shadow-[#39A5D8]/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent">
                  INFORMACIÓN DE PASAJEROS ({cart.length} {cart.length === 1 ? 'vuelo' : 'vuelos'})
                </h2>
              </div>

              {cart.map((item, index) => {
                const checkoutData = flightCheckoutData[index];
                const isExpanded = expandedFlightIndex === index;

                return (
                  <div key={item.id_item_carrito} className="space-y-4">
                    {/* Tarjeta de vuelo */}
                    <FlightCheckoutCard
                      cartItem={item}
                      isComplete={checkoutData?.isComplete || false}
                      onEditClick={() => handleExpandFlight(index)}
                    />

                    {/* Formulario expandible */}
                    {isExpanded && checkoutData && (
                      <div className="animate-fade-in">
                        <TravelerForm
                          index={index + 1}
                          data={checkoutData.travelerInfo!}
                          onChange={(data) => updateTravelerInfo(index, data)}
                          flightInfo={{
                            origin: item.vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.codigo_iata || 'N/A',
                            destination: item.vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.codigo_iata || 'N/A',
                            date: new Date(item.vuelo.salida_programada_utc).toLocaleDateString('es-CO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              totalAmount={totalAmount}
              itemCount={totalForms}
              completedCount={getCompletedCount()}
              onProceedToPayment={handleProceedToPayment}
              isProcessing={isProcessing}
              canProceed={allFormsComplete() && userBalance >= totalAmount}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmación de pago */}
      <PaymentConfirmationModal
        isOpen={showModal}
        isSuccess={paymentResult?.success || false}
        message={paymentResult?.message || ''}
        transactionId={paymentResult?.transactionId}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default CheckoutPage;