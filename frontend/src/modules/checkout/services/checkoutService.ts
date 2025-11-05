import api from '../../../api/axios';

// Interfaces
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

export interface CheckoutItem {
  vueloID: number;
  Clase: 'economica' | 'primera_clase';
  CantidadDePasajeros: number;
  pasajeros: Pasajero[];
}

export interface CheckoutPayload {
  [key: `item${number}`]: CheckoutItem;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  remainingBalance?: number;
  orderId?: string;
}

class CheckoutService {
  /**
   * Procesar checkout completo
   * Envía los datos al endpoint POST /api/v1/checkout
   */
  async processCheckout(payload: CheckoutPayload): Promise<PaymentResult> {
    try {
      console.log('📤 Enviando checkout:', JSON.stringify(payload, null, 2));
      
      // Validar payload antes de enviar
      const validationResult = this.validateCheckoutPayload(payload);
      if (!validationResult.valid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await api.post('/checkout', payload);
      
      console.log('✅ Respuesta del checkout:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Tu reserva ha sido procesada exitosamente. ¡Buen viaje!',
        transactionId: response.data.transactionId || response.data.orderId || this.generateTransactionId(),
        remainingBalance: response.data.remainingBalance,
        orderId: response.data.orderId
      };
      
    } catch (error) {
      console.error('❌ Error en processCheckout:', error);
      
      let errorMessage = 'Error al procesar el checkout. Por favor intenta nuevamente.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Obtener saldo del usuario
   */
  async getUserBalance(): Promise<number> {
    try {
      const response = await api.get('/monedero');
      return response.data.saldoActual || 0;
    } catch (error) {
      console.error('⚠️ Error al obtener saldo:', error);
      throw new Error('No se pudo obtener el saldo de la billetera');
    }
  }

  /**
   * Validar estructura de pasajero
   */
  validatePasajero(pasajero: Pasajero): boolean {
    const requiredFields: (keyof Pasajero)[] = [
      'nombre', 
      'apellido', 
      'dni', 
      'phone', 
      'email', 
      'genero', 
      'fecha_nacimiento'
    ];
    
    return requiredFields.every(field => {
      const value = pasajero[field];
      return value !== null && value !== undefined && value !== '';
    });
  }

  /**
   * Validar un item de checkout
   */
  validateCheckoutItem(item: CheckoutItem): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.vueloID || item.vueloID <= 0) {
      errors.push('ID de vuelo inválido');
    }

    if (!item.Clase || (item.Clase !== 'economica' && item.Clase !== 'primera_clase')) {
      errors.push('Clase de vuelo no válida (debe ser "economica" o "primera_clase")');
    }

    if (!item.pasajeros || item.pasajeros.length === 0) {
      errors.push('No hay pasajeros en este item');
    }

    if (item.CantidadDePasajeros !== item.pasajeros.length) {
      errors.push(
        `Cantidad de pasajeros (${item.CantidadDePasajeros}) no coincide con pasajeros proporcionados (${item.pasajeros.length})`
      );
    }

    item.pasajeros.forEach((pasajero, idx) => {
      if (!this.validatePasajero(pasajero)) {
        errors.push(`Pasajero ${idx + 1} tiene información incompleta`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar todo el payload de checkout
   */
  validateCheckoutPayload(payload: CheckoutPayload): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    const itemKeys = Object.keys(payload) as Array<keyof CheckoutPayload>;
    
    if (itemKeys.length === 0) {
      allErrors.push('El payload está vacío');
      return { valid: false, errors: allErrors };
    }

    itemKeys.forEach(key => {
      const item = payload[key];
      const validation = this.validateCheckoutItem(item);
      
      if (!validation.valid) {
        allErrors.push(`${key}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Generar ID de transacción único
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

export default new CheckoutService();