// src/modules/checkout/services/checkoutService.ts

import type { PaymentResult } from '../../../types/checkout';
import api from '../../../api/axios';

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
   */
  async submitCheckout(payload: Record<string, any>): Promise<any> {
    try {
      const response = await api.post('/checkout', payload);
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
   * Procesar pago
   */
  async processPayment(data: CheckoutPaymentData): Promise<PaymentResult> {
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.post('/checkout/process-payment', data);
      // return response.data;

      // ==================== SIMULACIÓN ====================
      console.log('📦 Datos de checkout enviados:', data);
      
      const userBalance = await this.getUserBalance();
      
      if (userBalance < data.totalAmount) {
        return {
          success: false,
          message: `Saldo insuficiente. Tu saldo actual es $${userBalance.toLocaleString('es-CO')} y necesitas $${data.totalAmount.toLocaleString('es-CO')}.`
        };
      }

      const isSuccessful = Math.random() > 0.15;
      
      if (isSuccessful) {
        const transactionId = this.generateTransactionId();
        const remainingBalance = userBalance - data.totalAmount;
        
        return {
          success: true,
          message: 'Tu pago ha sido procesado exitosamente. ¡Buen viaje!',
          transactionId,
          remainingBalance
        };
      } else {
        return {
          success: false,
          message: 'El pago no pudo ser procesado. Por favor verifica tu método de pago e intenta nuevamente.'
        };
      }
      
    } catch (error: any) {
      console.error('Error en processPayment:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar el pago. Intenta nuevamente.'
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
      console.error('Error al obtener saldo:', error);
      return 500000 + Math.random() * 4500000;
    }
  }

  /**
   * Generar ID de transacción
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}

export const checkoutService = new CheckoutService();