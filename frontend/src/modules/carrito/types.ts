// Tipos globales para el carrito y pasajeros

export interface Passenger {
  name: string;
  lastName: string;
  dni: string;
  age: number;
  isAdult?: boolean;
}

export interface CartTicket {
  id: string; // id temporal o del backend
  flightId: number;
  classType: 'economica' | 'primera_clase';
  seatNumber?: string;
  passenger: Passenger;
  expiresAt: Date;
  status: 'reservado' | 'pagado' | 'cancelado';
}
