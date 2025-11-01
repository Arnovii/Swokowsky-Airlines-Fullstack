// src/types/checkout.ts

export interface TravelerInfo {
  documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  contacto_nombre: string;
  contacto_telefono: string;
}

export interface FlightCheckoutData {
  id_vuelo: number;
  travelerInfoList: TravelerInfo[];
  isComplete: boolean;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  remainingBalance?: number;
}