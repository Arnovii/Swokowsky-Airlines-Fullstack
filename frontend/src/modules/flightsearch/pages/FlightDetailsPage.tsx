import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import FlightInfo from '../components/FlightInfo';
import ClassSelector from '../components/ClassSelector';
import PassengerCountSelector from '../components/PassengerCountSelector';
import PassengerForm from '../components/PassengerForm';
import type { PassengerFormData } from '../components/PassengerForm';
import ReservationSummary from '../components/ReservationSummary';
import { useCart } from '../../../context/CartContext';
import type { CartTicket } from '../../../context/types';
import { reserveTickets, buyTickets } from '../services/ticketService';

// Página de detalles de vuelo para reservar/comprar tickets
// Modular: usará componentes separados para formulario de pasajeros, selección de clase, resumen, etc.

const mockFlight = {
  id: '1',
  aircraftModel: 'Airbus A320',
  origin: { codigo_iata: 'BOG', ciudad: 'Bogotá' },
  destination: { codigo_iata: 'MDE', ciudad: 'Medellín' },
  departureTimeUTC: '2025-10-10T08:00:00Z',
  arrivalTimeUTC: '2025-10-10T09:00:00Z',
  durationMinutes: 60,
  availableClasses: ['economica', 'primera_clase'],
  price: 200,
};

const FlightDetailsPage = () => {
  const { id } = useParams();
  // TODO: fetch flight by id, usar mock por ahora
  const flight = mockFlight;

  const [selectedClass, setSelectedClass] = useState(flight.availableClasses[0]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<PassengerFormData[]>([
    { name: '', lastName: '', dni: '', age: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  // Carrito global
  const { addToCart } = useCart();

  // Actualizar formularios de pasajeros según cantidad
  React.useEffect(() => {
    setPassengers((prev) => {
      if (passengerCount > prev.length) {
        return [
          ...prev,
          ...Array(passengerCount - prev.length).fill({ name: '', lastName: '', dni: '', age: 0 }),
        ];
      } else {
        return prev.slice(0, passengerCount);
      }
    });
  }, [passengerCount]);

  // Validaciones y handlers
  const handlePassengerChange = (idx: number, data: PassengerFormData) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? data : p)));
  };

  const handleReserve = async () => {
    setLoading(true);
    const tickets = await reserveTickets(
      flight.id,
      selectedClass as 'economica' | 'primera_clase',
      passengers
    );
    tickets.forEach(addToCart);
    setLoading(false);
    alert('Reserva simulada (24h sin pagar). Tickets agregados al carrito.');
  };

  const handleBuy = async () => {
    setLoading(true);
    const tickets = await buyTickets(
      flight.id,
      selectedClass as 'economica' | 'primera_clase',
      passengers
    );
    tickets.forEach(addToCart);
    setLoading(false);
    alert('Compra simulada. Tickets agregados al carrito.');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Detalles del vuelo y reserva</h1>
      <div className="flex flex-col gap-6 md:gap-8">
        <FlightInfo flight={flight} />
        <ClassSelector
          availableClasses={flight.availableClasses}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />
        <PassengerCountSelector count={passengerCount} setCount={setPassengerCount} max={5} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passengers.map((data, idx) => (
            <PassengerForm
              key={idx}
              index={idx}
              data={data}
              onChange={(d) => handlePassengerChange(idx, d)}
            />
          ))}
        </div>
        <ReservationSummary
          flight={flight}
          selectedClass={selectedClass}
          passengers={passengers}
          pricePerPerson={flight.price}
          onReserve={handleReserve}
          onBuy={handleBuy}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default FlightDetailsPage;
