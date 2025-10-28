import { useState, useEffect, useCallback } from 'react';
import type { Flight } from '../types/Flight';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import FlightInfo from '../components/FlightInfo';
import ClassSelector from '../components/ClassSelector';
import PassengerFormModern from '../components/PassengerForm';
import type { PassengerFormData } from '../components/PassengerForm';
import BookingHolderForm from '../components/BookingHolderForm';
import ReservationSummary from '../components/ReservationSummary';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { reserveTickets, buyTickets } from '../services/ticketService';
import { FlightService } from '../services/flightService';

// ================== COMPONENTES DE TOAST MODERNOS ==================
const SuccessIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'border-green-500' : ''}
            ${toast.type === 'error' ? 'border-red-500' : ''}
            ${toast.type === 'warning' ? 'border-amber-500' : ''}
            animate-slide-in-right
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' && <SuccessIcon />}
              {toast.type === 'error' && <ErrorIcon />}
              {toast.type === 'warning' && <WarningIcon />}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FlightDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loadingFlight, setLoadingFlight] = useState(true);
  const [errorFlight, setErrorFlight] = useState<string | null>(null);

  // ================== ESTADO Y FUNCIONES PARA TOASTS ==================
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  // Función helper para mostrar toasts de error rápidamente
  const showErrorToast = useCallback((title: string, message: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const showWarningToast = useCallback((title: string, message: string) => {
    addToast('warning', title, message);
  }, [addToast]);

  // Función para verificar si el usuario es administrador
  const isUserAdmin = useCallback(() => {
    return user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'root';
  }, [user]);

  useEffect(() => {
    if (!id) {
      setErrorFlight('No se proporcionó un ID de vuelo.');
      setLoadingFlight(false);
      return;
    }
    setLoadingFlight(true);
    setErrorFlight(null);

    type Tarifa = { clase: string; precio_base: number };

    FlightService.getFlightById(Number(id))
      .then((data) => {
        const tarifas: Tarifa[] = Array.isArray(data.tarifa) ? data.tarifa : [];
        const flightData: Flight = {
          idVuelo: data.id_vuelo || data.id || null,
          estado: data.estado || '',
          modeloAeronave: data.aeronave?.modelo || '',
          capacidadAeronave: data.aeronave?.capacidad || 0,
          precioEconomica: tarifas.find((t) => t.clase === 'economica')?.precio_base || 0,
          precioPrimeraClase: tarifas.find((t) => t.clase === 'primera_clase')?.precio_base || 0,
          salidaProgramadaUtc: data.salida_programada_utc || '',
          llegadaProgramadaUtc: data.llegada_programada_utc || '',
          availableSeats: data.available_seats || 0,
          durationMinutes: 0, // Puedes calcularlo si tienes fechas
          origen: {
            nombre: data.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.nombre || '',
            codigoIata: data.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.codigo_iata || '',
            ciudad: '', // Puedes mapear ciudad si está disponible
            pais: '',   // Puedes mapear país si está disponible
          },
          destino: {
            nombre: data.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.nombre || '',
            codigoIata: data.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.codigo_iata || '',
            ciudad: '', // Puedes mapear ciudad si está disponible
            pais: '',   // Puedes mapear país si está disponible
          },
          availableClasses: tarifas.map((t) => t.clase) || [],
          price: tarifas.find((t) => t.clase === 'economica')?.precio_base || 0,
          priceFirstClass: tarifas.find((t) => t.clase === 'primera_clase')?.precio_base || 0,
          aircraftModel: data.aeronave?.modelo || '',
          isInternational: false, // Puedes calcularlo si tienes info de países
          promocion: data.promocion ? {
            nombre: data.promocion.nombre || '',
            descuento: data.promocion.descuento || 0,
            fechaInicio: data.promocion.fecha_inicio || '',
            fechaFin: data.promocion.fecha_fin || '',
          } : undefined,
        };
        setFlight(flightData);
      })
      .catch((err) => {
        setErrorFlight('Error al cargar vuelo: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
      })
      .finally(() => setLoadingFlight(false));
  }, [id]);

  // Obtener número de pasajeros desde query param
  const passengerCount = parseInt(searchParams.get('passengers') || '1', 10);

  // Estado para los datos de cada pasajero
  const [passengerData, setPassengerData] = useState<PassengerFormData[]>(
    Array.from({ length: passengerCount }, () => ({
      gender: '',
      name: '',
      lastName: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      nationality: '',
      document: '',
      program: '',
      age: 0,
      dni: '',
    }))
  );

  // Handler para actualizar datos de cada pasajero
  const handlePassengerChange = (idx: number, field: string, value: string) => {
    setPassengerData(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  // Validaciones
  const hasDuplicateDocs = new Set(passengerData.map(p => p.document)).size < passengerData.length;
  const minors = passengerData.filter(p => {
    const year = parseInt(p.birthYear || '0', 10);
    return year && (2025 - year) < 18;
  });
  const adults = passengerData.filter(p => {
    const year = parseInt(p.birthYear || '0', 10);
    return year && (2025 - year) >= 18;
  });
  const minorsNeedAdults = minors.length > 0 && adults.length === 0;

  const [selectedClass, setSelectedClass] = useState('economica');

  // Actualizar selectedClass cuando flight cambie
  useEffect(() => {
    if (flight && flight.availableClasses && flight.availableClasses.length > 0) {
      setSelectedClass(flight.availableClasses[0]);
    }
  }, [flight]);

  const [loading, setLoading] = useState(false);

  // Carrito global
  const { addToCart } = useCart();


  const handleReserve = async () => {
    // Verificar si el usuario es administrador
    if (isUserAdmin()) {
      showWarningToast('Acceso restringido', 'Los administradores no pueden realizar reservas. Esta función es solo para clientes.');
      return;
    }

    if (!flight || !flight.idVuelo) {
      showErrorToast('Error de reserva', 'No se puede reservar, datos del vuelo incompletos.');
      return;
    }

    // Validar datos de pasajeros campo por campo (uno a la vez)
    for (let index = 0; index < passengerData.length; index++) {
      const passenger = passengerData[index];
      
      if (!passenger.name || passenger.name.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El nombre es obligatorio`);
        return;
      }
      if (!passenger.lastName || passenger.lastName.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El apellido es obligatorio`);
        return;
      }
      if (!passenger.document || passenger.document.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El documento es obligatorio`);
        return;
      }
      if (!passenger.birthDay || passenger.birthDay.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El día de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.birthMonth || passenger.birthMonth.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El mes de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.birthYear || passenger.birthYear.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El año de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.nationality || passenger.nationality.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: La nacionalidad es obligatoria`);
        return;
      }
      if (!passenger.gender || passenger.gender.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El género es obligatorio`);
        return;
      }
    }

    if (hasDuplicateDocs) {
      showWarningToast('Documentos duplicados', 'No puede haber dos pasajeros con el mismo documento.');
      return;
    }

    if (minorsNeedAdults) {
      showWarningToast('Menores sin adultos', 'Todo menor de edad debe tener al menos un acompañante adulto.');
      return;
    }

    setLoading(true);
    try {
      const tickets = await reserveTickets(
        flight.idVuelo,
        selectedClass as 'economica' | 'primera_clase',
        passengerData
      );
      tickets.forEach(addToCart);
      addToast('success', '¡Reserva exitosa!', 'Reserva simulada (24h sin pagar). Redirigiendo al perfil...');
      
      // Esperar un momento para que el usuario vea el toast y luego navegar al perfil
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (error) {
      console.error('Error en reserva:', error);
      showErrorToast('Error en la reserva', 'Error al realizar la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    // Verificar si el usuario es administrador
    if (isUserAdmin()) {
      showWarningToast('Acceso restringido', 'Los administradores no pueden realizar compras. Esta función es solo para clientes.');
      return;
    }

    if (!flight || !flight.idVuelo) {
      showErrorToast('Error de compra', 'No se puede comprar, datos del vuelo incompletos.');
      return;
    }

    // Validar datos de pasajeros campo por campo (uno a la vez)
    for (let index = 0; index < passengerData.length; index++) {
      const passenger = passengerData[index];
      
      if (!passenger.name || passenger.name.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El nombre es obligatorio`);
        return;
      }
      if (!passenger.lastName || passenger.lastName.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El apellido es obligatorio`);
        return;
      }
      if (!passenger.document || passenger.document.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El documento es obligatorio`);
        return;
      }
      if (!passenger.birthDay || passenger.birthDay.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El día de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.birthMonth || passenger.birthMonth.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El mes de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.birthYear || passenger.birthYear.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El año de nacimiento es obligatorio`);
        return;
      }
      if (!passenger.nationality || passenger.nationality.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: La nacionalidad es obligatoria`);
        return;
      }
      if (!passenger.gender || passenger.gender.trim() === '') {
        showErrorToast('Campo obligatorio', `Pasajero ${index + 1}: El género es obligatorio`);
        return;
      }
    }

    if (hasDuplicateDocs) {
      showWarningToast('Documentos duplicados', 'No puede haber dos pasajeros con el mismo documento.');
      return;
    }

    if (minorsNeedAdults) {
      showWarningToast('Menores sin adultos', 'Todo menor de edad debe tener al menos un acompañante adulto.');
      return;
    }

    setLoading(true);
    try {
      const tickets = await buyTickets(
        flight.idVuelo,
        selectedClass as 'economica' | 'primera_clase',
        passengerData
      );
      tickets.forEach(addToCart);
      addToast('success', '¡Compra exitosa!', 'Compra simulada. Redirigiendo al perfil...');
      
      // Esperar un momento para que el usuario vea el toast y luego navegar al perfil
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (error) {
      console.error('Error en compra:', error);
      showErrorToast('Error en la compra', 'Error al realizar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingFlight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A5D8] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Cargando vuelo</h3>
          <p className="text-gray-500">Preparando los mejores detalles para ti...</p>
        </div>
      </div>
    );
  }
  if (errorFlight || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar</h3>
          <p className="text-gray-600">{errorFlight || 'Vuelo no encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón de regresar moderno */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 text-white font-semibold transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-lg">Regresar</span>
          </button>
        </div>

        {/* Header moderno */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0F6899] to-[#39A5D8] bg-clip-text text-transparent mb-2">
            Detalles del Vuelo
          </h1>
          <p className="text-white/80 text-lg">Completa tu reserva y prepárate para despegar</p>
        </div>

        {/* Contenedor principal con diseño moderno */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
          <div className="flex flex-col gap-8 md:gap-12">
            
            {/* Información del vuelo */}
            <div className="bg-gradient-to-r from-[#eaf6ff] to-[#b6d6f2] rounded-2xl p-6 border border-[#39A5D8]/30">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#0F6899] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0F6899]">Información del Vuelo</h2>
              </div>
              <FlightInfo flight={flight} />
            </div>

            {/* Selección de clase */}
            <div className="bg-gradient-to-r from-[#d8f0ff] to-[#b6d6f2] rounded-2xl p-6 border border-[#39A5D8]/30">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#39A5D8] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0F6899]">Selecciona tu Clase</h2>
              </div>
              <ClassSelector
                availableClasses={flight.availableClasses ?? []}
                selectedClass={selectedClass}
                onSelectClass={setSelectedClass}
              />
            </div>
        {/* Sección de formularios de pasajeros */}
        <div className="space-y-6">
          <div className="border-l-4 border-[#39A5D8] pl-6">
            <h2 className="text-2xl font-bold text-[#0F6899] mb-2">Información de Pasajeros</h2>
            <p className="text-black">Completa los datos de todos los viajeros</p>
          </div>
          
          <div className="grid gap-6">
            {Array.from({ length: passengerCount }, (_, idx) => (
              <div key={`passenger-${idx}`} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50">
                <PassengerFormModern
                  index={idx + 1}
                  data={passengerData[idx]}
                  onChange={(field, value) => handlePassengerChange(idx, field, value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de validación modernas */}
        {(hasDuplicateDocs || minorsNeedAdults) && (
          <div className="space-y-4">
            {hasDuplicateDocs && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">No puede haber dos pasajeros con el mismo documento.</p>
                  </div>
                </div>
              </div>
            )}
            {minorsNeedAdults && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-amber-700 font-medium">Todo menor de edad debe tener al menos un acompañante adulto.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulario de titular de reserva */}
        <div className="bg-gradient-to-r from-[#c5e8ff] to-[#b6d6f2] rounded-2xl p-6 border border-[#39A5D8]/30">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#123361] rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F6899]">Titular de la Reserva</h2>
          </div>
          <BookingHolderForm />
        </div>

        {/* Resumen de reserva */}
        <div className="bg-gradient-to-r from-[#eaf6ff] to-[#d8f0ff] rounded-2xl p-6 border border-[#39A5D8]/30">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-[#39A5D8] rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F6899]">Resumen y Confirmación</h2>
          </div>
          
          {/* Banner de advertencia para administradores */}
          {isUserAdmin() && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-amber-700 font-medium">
                    <strong>Acceso restringido:</strong> Como administrador, no puedes realizar reservas o compras. 
                    Esta función está disponible únicamente para clientes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <ReservationSummary
            flight={flight}
            selectedClass={selectedClass}
            passengers={passengerData}
            pricePerPerson={selectedClass === 'primera_clase' ? (flight.priceFirstClass ?? flight.precioPrimeraClase ?? 450000) : (flight.price ?? flight.precioEconomica ?? 250000)}
            onReserve={handleReserve}
            onBuy={handleBuy}
            loading={loading}
            disabled={isUserAdmin()}
          />
        </div>
          </div>
        </div>
      </div>

      {/* Contenedor de toasts modernos */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default FlightDetailsPage;
