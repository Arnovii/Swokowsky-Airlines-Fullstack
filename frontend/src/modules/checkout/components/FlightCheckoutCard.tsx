import type { CartItem } from '../../carrito/service/cartService';

interface FlightCheckoutCardProps {
  cartItem: CartItem;
  isComplete: boolean;
  onEditClick: () => void;
}

const FlightCheckoutCard: React.FC<FlightCheckoutCardProps> = ({ 
  cartItem, 
  isComplete, 
  onEditClick 
}) => {
  const flight = cartItem.vuelo;
  
  // Formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassLabel = (clase: string) => {
    return clase === 'economica' ? 'Económica' : 'Primera Clase';
  };

  // dentro de FlightCheckoutCard, donde calculas precio:
const precioUnitario =
  cartItem.clase === "economica"
    ? flight.tarifas?.find(t => t.clase === "economica")?.precio_base || 0
    : flight.tarifas?.find(t => t.clase === "primera_clase")?.precio_base || 0;

const descuento = flight.promocion?.descuento ?? 0; // 0.2 = 20%
const precioTotal = precioUnitario * cartItem.cantidad_de_tickets * (1 - descuento);



  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header con estado */}
      <div className={`p-4 ${isComplete ? 'bg-green-50 border-b-2 border-green-200' : 'bg-amber-50 border-b-2 border-amber-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}>
              {isComplete ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${isComplete ? 'text-green-700' : 'text-amber-700'}`}>
                {isComplete ? 'Información Completa' : 'Información Pendiente'}
              </p>
              <p className={`text-xs ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                {cartItem.cantidad_de_tickets} {cartItem.cantidad_de_tickets === 1 ? 'Pasajero' : 'Pasajeros'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onEditClick}
            className="px-4 py-2 bg-[#39A5D8] hover:bg-[#0F6899] text-white rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            {isComplete ? 'Editar' : 'Completar'}
          </button>
        </div>
      </div>

      {/* Información del vuelo */}
      <div className="p-6">
        {/* Ruta y horarios */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-2xl font-bold text-[#0F6899]">
                {flight.aeropuerto_origen?.codigo_iata|| 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {flight.aeropuerto_origen?.nombre || 'Origen'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(flight.salida_programada_utc)}
              </p>
            </div>

            <div className="flex-shrink-0 px-4">
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-[#39A5D8] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-xs text-gray-500 font-medium">
                  Vuelo #{flight.id_vuelo}
                </span>
              </div>
            </div>

            <div className="flex-1 text-right">
              <p className="text-2xl font-bold text-[#0F6899]">
                {flight.aeropuerto_destino?.codigo_iata || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {flight.aeropuerto_destino?.nombre || 'Destino'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(flight.llegada_programada_utc)}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Aeronave</p>
            <p className="text-sm font-semibold text-gray-700">
              {flight.aeronave?.modelo || 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Clase</p>
            <p className="text-sm font-semibold text-gray-700">
              {getClassLabel(cartItem.clase)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Precio Unitario</p>
            <p className="text-sm font-semibold text-[#0F6899]">
              ${precioUnitario.toLocaleString('es-CO')}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-lg font-bold text-[#0F6899]">
              ${precioTotal.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Promoción si existe */}
        {flight.promocion && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {flight.promocion.nombre}
                </p>
                <p className="text-xs text-green-600">
                  {(flight.promocion.descuento * 100).toFixed(0)}% de descuento aplicado
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlightCheckoutCard;