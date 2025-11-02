/**
 * Información de un pasajero (coincide con el backend)
 */
export interface Pasajero {
  nombre: string;
  apellido: string;
  dni: string;
  phone: string;
  email: string;
  contact_name: string | null;
  phone_name: string | null;
  genero: 'M' | 'F' | 'X';
  fecha_nacimiento: string; // formato: YYYY-MM-DD
}

/**
 * Item de checkout para un vuelo específico
 */
export interface CheckoutItem {
  vueloID: number;
  Clase: 'economica' | 'primera_clase';
  CantidadDePasajeros: number;
  pasajeros: Pasajero[];
}

/**
 * Payload completo del checkout (formato del endpoint)
 */
export interface CheckoutPayload {
  [key: `item${number}`]: CheckoutItem;
}

/**
 * Resultado del proceso de pago
 */
export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  remainingBalance?: number;
  orderId?: string;
}

/**
 * Datos de checkout por vuelo (para uso interno en el frontend)
 */
export interface FlightCheckoutData {
  id_vuelo: number;
  clase: 'economica' | 'primera_clase';
  cantidad_tickets: number;
  pasajeros: Pasajero[];
  isComplete: boolean;
}

/**
 * Estado del formulario de un pasajero individual
 */
export interface PasajeroFormState extends Pasajero {
  errors?: Partial<Record<keyof Pasajero, string>>;
}

/**
 * Respuesta del endpoint de checkout
 */
export interface CheckoutResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  orderId?: string;
  remainingBalance?: number;
  reservations?: Array<{
    id_reserva: number;
    id_vuelo: number;
    estado: string;
  }>;
}

/**
 * Información del saldo del usuario
 */
export interface UserBalance {
  balance: number;
  currency?: string;
}

/**
 * Validación de formulario
 */
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}