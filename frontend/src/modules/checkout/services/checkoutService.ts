// src/modules/checkout/services/checkoutService.ts

import type { PaymentResult } from '../../../types/checkout';
import api from '../../../api/axios';

interface Pasajero {
  nombre: string;
  apellido: string;
  dni: string;
  phone: string;
  email: string;
  contact_name: string | null;
  phone_name: string | null;
  genero: 'M' | 'F' | 'O';
  fecha_nacimiento: string; // formato: YYYY-MM-DD
}

interface CheckoutItem {
  vueloID: number;
  Clase: string;
  CantidadDePasajeros: number;
  pasajeros: Pasajero[];
}

interface CheckoutPayload {
  [key: `item${number}`]: CheckoutItem;
}

interface CheckoutPaymentData {
  items: Array<{
    cartItemId: number;
    flightId: number;
    clase: string;
    cantidadTickets: number;
    travelerInfo: any;
  }>;
  totalAmount: number;
}

class CheckoutService {
  /**
   * Enviar datos de checkout al backend
   * Transforma los datos del carrito al formato esperado por el endpoint
   */
  async submitCheckout(cartItems: any[]): Promise<any> {
    try {
      // Transformar los datos del carrito al formato del backend
      const payload: CheckoutPayload = {};
      
      cartItems.forEach((item, index) => {
        payload[`item${index + 1}`] = {
          vueloID: item.flightId || item.vueloID,
          Clase: item.clase || item.Clase,
          CantidadDePasajeros: item.pasajeros?.length || item.CantidadDePasajeros || 0,
          pasajeros: item.pasajeros || []
        };
      });

      console.log('📤 Enviando checkout:', payload);
      
      const response = await api.post('/checkout', payload);
      
      console.log('✅ Respuesta del checkout:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error en submitCheckout:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 
        'Error al procesar el checkout. Por favor intenta nuevamente.'
      );
    }
  }

  /**
   * Procesar pago completo (validar pasajeros y enviar checkout)
   */
  async processPayment(data: CheckoutPaymentData): Promise<PaymentResult> {
    try {
      // Validar que todos los items tengan información completa de pasajeros
      const incompleteItems = data.items.filter(
        item => !item.travelerInfo || item.travelerInfo.length === 0
      );

      if (incompleteItems.length > 0) {
        return {
          success: false,
          message: 'Por favor completa la información de todos los pasajeros antes de continuar.'
        };
      }

      // Transformar los datos al formato del backend
      const cartItems = data.items.map(item => ({
        flightId: item.flightId,
        clase: item.clase,
        pasajeros: item.travelerInfo
      }));

      // Enviar el checkout al backend
      const checkoutResponse = await this.submitCheckout(cartItems);

      // Si el checkout fue exitoso, retornar resultado positivo
      if (checkoutResponse) {
        const transactionId = checkoutResponse.transactionId || 
                            checkoutResponse.orderId || 
                            this.generateTransactionId();
        
        return {
          success: true,
          message: 'Tu pago ha sido procesado exitosamente. ¡Buen viaje!',
          transactionId,
          remainingBalance: checkoutResponse.remainingBalance
        };
      }

      return {
        success: false,
        message: 'El pago no pudo ser procesado. Por favor intenta nuevamente.'
      };
      
    } catch (error: any) {
      console.error('❌ Error en processPayment:', error);
      
      return {
        success: false,
        message: error.message || 
                error.response?.data?.message || 
                'Error al procesar el pago. Intenta nuevamente.'
      };
    }
  }

  /**
   * Obtener saldo del usuario
   */
  async getUserBalance(): Promise<number> {
    try {
      const response = await api.get('/user/balance');
      return response.data.balance;
    } catch (error) {
      console.error('⚠️ Error al obtener saldo (usando mock):', error);
      // Retornar un saldo simulado si falla
      return 500000 + Math.random() * 4500000;
    }
  }

  /**
   * Generar ID de transacción único
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Validar estructura de pasajero
   */
  validatePasajero(pasajero: any): boolean {
    const requiredFields = ['nombre', 'apellido', 'dni', 'phone', 'email', 'genero', 'fecha_nacimiento'];
    return requiredFields.every(field => pasajero[field] && pasajero[field] !== '');
  }

  /**
   * Validar todos los pasajeros de un item
   */
  validateCheckoutItem(item: CheckoutItem): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.vueloID || item.vueloID <= 0) {
      errors.push('ID de vuelo inválido');
    }

    if (!item.Clase || item.Clase.trim() === '') {
      errors.push('Clase de vuelo no especificada');
    }

    if (!item.pasajeros || item.pasajeros.length === 0) {
      errors.push('No hay pasajeros en este item');
    }

    if (item.CantidadDePasajeros !== item.pasajeros.length) {
      errors.push(`Cantidad de pasajeros (${item.CantidadDePasajeros}) no coincide con pasajeros proporcionados (${item.pasajeros.length})`);
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
}

export const checkoutService = new CheckoutService();