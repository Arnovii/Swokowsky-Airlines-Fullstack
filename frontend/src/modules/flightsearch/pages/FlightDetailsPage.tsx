import { useState, useEffect } from 'react';
import type { Flight } from '../types/Flight';
import { useSearchParams, useParams } from 'react-router-dom';
import FlightInfo from '../components/FlightInfo';
import ClassSelector from '../components/ClassSelector';
import PassengerFormModern from '../components/PassengerForm';
import type { PassengerFormData } from '../components/PassengerForm';
import BookingHolderForm from '../components/BookingHolderForm';
import ReservationSummary from '../components/ReservationSummary';
import { useCart } from '../../../context/CartContext';
import { reserveTickets, buyTickets } from '../services/ticketService';
import { FlightService } from '../services/flightService';

const FlightDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loadingFlight, setLoadingFlight] = useState(true);
  const [errorFlight, setErrorFlight] = useState<string | null>(null);

  useEffect(() => {
    // Leer parámetros de búsqueda desde la URL con nombres correctos
    const originCityId = parseInt(searchParams.get('originCityId') || '0', 10);
    const destinationCityId = parseInt(searchParams.get('destinationCityId') || '0', 10);
    const departureDate = searchParams.get('departureDate') || '';
    const returnDate = searchParams.get('returnDate') || '';
    const roundTrip = searchParams.get('roundTrip') === 'true';
    const passengers = parseInt(searchParams.get('passengers') || '1', 10);

    // Validar parámetros requeridos
    if (!originCityId || !destinationCityId || !departureDate || passengers < 1 || passengers > 5) {
      setErrorFlight('Faltan parámetros requeridos para buscar el vuelo. Verifica origen, destino, fecha y número de pasajeros.');
      setLoadingFlight(false);
      return;
    }

    const searchCriteria = {
      originCityId,
      destinationCityId,
      departureDate,
      roundTrip,
      returnDate,
      passengers,
    };

    setLoadingFlight(true);
    setErrorFlight(null);
    FlightService.searchFlights(searchCriteria)
      .then((res: { outbound?: Flight[]; inbound?: Flight[] }) => {
        let found: Flight | null = null;
        // Buscar solo por idVuelo numérico
        if (res.outbound) {
          found = res.outbound.find((f: Flight) => String(f.idVuelo) === String(id)) || null;
        }
        if (!found && res.inbound) {
          found = res.inbound.find((f: Flight) => String(f.idVuelo) === String(id)) || null;
        }
        // Si no se encuentra, mostrar el primer vuelo disponible
        if (!found) {
          found = (res.outbound && res.outbound.length > 0) ? res.outbound[0] : (res.inbound && res.inbound.length > 0 ? res.inbound[0] : null);
        }
        setFlight(found);
      })
      .catch((err: Error) => {
        setErrorFlight('Error al cargar vuelo: ' + (err?.message || ''));
      })
      .finally(() => setLoadingFlight(false));
  }, [id, searchParams]);

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

  const [selectedClass, setSelectedClass] = useState(flight?.availableClasses?.[0] ?? 'economica');
  const [loading, setLoading] = useState(false);

  // Carrito global
  const { addToCart } = useCart();


  const handleReserve = async () => {
    if (!flight) return;
    setLoading(true);
    const tickets = await reserveTickets(
      flight.idVuelo,
      selectedClass as 'economica' | 'primera_clase',
      passengerData
    );
    tickets.forEach(addToCart);
    setLoading(false);
    alert('Reserva simulada (24h sin pagar). Tickets agregados al carrito.');
  };

  const handleBuy = async () => {
    if (!flight) return;
    setLoading(true);
    const tickets = await buyTickets(
      flight.idVuelo,
      selectedClass as 'economica' | 'primera_clase',
      passengerData
    );
    tickets.forEach(addToCart);
    setLoading(false);
    alert('Compra simulada. Tickets agregados al carrito.');
  };

  if (loadingFlight) {
    return <div className="max-w-4xl mx-auto py-8 px-4 text-center">Cargando vuelo...</div>;
  }
  if (errorFlight || !flight) {
    return <div className="max-w-4xl mx-auto py-8 px-4 text-center text-red-600">{errorFlight || 'Vuelo no encontrado.'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Detalles del vuelo y reserva</h1>
      <div className="flex flex-col gap-6 md:gap-8">
        <FlightInfo flight={flight} />
        <ClassSelector
          availableClasses={flight.availableClasses ?? []}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />
        <div className="flex flex-col gap-6">
          {Array.from({ length: passengerCount }).map((_, idx) => (
            <PassengerFormModern
              key={idx}
              index={idx + 1}
              data={passengerData[idx]}
              onChange={(field, value) => handlePassengerChange(idx, field, value)}
            />
          ))}
        </div>
        {hasDuplicateDocs && (
          <div className="text-red-600 font-bold font-sans mb-4">No puede haber dos pasajeros con el mismo documento.</div>
        )}
        {minorsNeedAdults && (
          <div className="text-yellow-600 font-bold font-sans mb-4">Todo menor de edad debe tener al menos un acompañante adulto.</div>
        )}
        <BookingHolderForm />
        <ReservationSummary
          flight={flight}
          selectedClass={selectedClass}
          passengers={passengerData}
          pricePerPerson={flight.price ?? 0}
          onReserve={handleReserve}
          onBuy={handleBuy}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default FlightDetailsPage;
