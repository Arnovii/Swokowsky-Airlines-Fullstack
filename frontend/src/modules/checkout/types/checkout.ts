// src/types/checkout.ts

export interface TravelerInfo {
  documento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'Otro';
  telefono: string;
  email: string;
  nombreContacto: string;
  telefonoContacto: string;
}

export interface FlightCheckoutData {
  ticketId: string;
  flightId: number;
  travelerInfo: TravelerInfo | null;
  isComplete: boolean;
}

export interface CheckoutState {
  flights: FlightCheckoutData[];
  currentStep: number;
  totalAmount: number;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  remainingBalance?: number;
}