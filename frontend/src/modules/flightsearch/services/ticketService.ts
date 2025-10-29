// ticketService.ts
// Simulación de llamadas a la API para reservar y comprar tickets

import type { PassengerFormData } from '../../checkout/PassengerForm';
import type { CartTicket } from '../../carrito/types';

export async function reserveTickets(
  flightId: number,
  selectedClass: 'economica' | 'primera_clase',
  passengers: PassengerFormData[],
): Promise<CartTicket[]> {
  // Simula llamada a la API para reservar tickets
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return passengers.map((p, idx) => ({
    id: `${String(flightId)}-rsv-${Date.now()}-${idx}`,
    flightId,
    classType: selectedClass,
    seatNumber: undefined, // Asignación aleatoria pendiente
    passenger: { ...p, isAdult: p.age >= 18 },
    expiresAt,
    status: 'reservado',
  }));
}

export async function buyTickets(
  flightId: number,
  selectedClass: 'economica' | 'primera_clase',
  passengers: PassengerFormData[],
): Promise<CartTicket[]> {
  // Simula llamada a la API para comprar tickets
  return passengers.map((p, idx) => ({
    id: `${String(flightId)}-buy-${Date.now()}-${idx}`,
    flightId,
    classType: selectedClass,
    seatNumber: undefined, // Asignación aleatoria pendiente
    passenger: { ...p, isAdult: p.age >= 18 },
    expiresAt: new Date(),
    status: 'pagado',
  }));
}
