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
   * Procesar pago (actualmente simulado, reemplazar con llamada real a API)
   */
  async processPayment(data: CheckoutPaymentData): Promise<PaymentResult> {
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.post('/checkout/process-payment', data);
      // return response.data;

      // ==================== SIMULACIÓN ====================
      console.log('📦 Datos de checkout enviados:', data);
      
      // Simular verificación de saldo
      const userBalance = await this.getUserBalance();
      
      if (userBalance < data.totalAmount) {
        return {
          success: false,
          message: `Saldo insuficiente. Tu saldo actual es $${userBalance.toLocaleString('es-CO')} y necesitas $${data.totalAmount.toLocaleString('es-CO')}.`
        };
      }

      // Simular éxito del pago con 85% de probabilidad
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
      // ==================== FIN SIMULACIÓN ====================
      
    } catch (error: any) {
      console.error('Error en processPayment:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar el pago. Intenta nuevamente.'
      };
    }
  }

  /**
   * Obtener saldo del usuario (simulado)
   */
  private async getUserBalance(): Promise<number> {
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.get('/user/balance');
      // return response.data.balance;

      // Simulación: retornar saldo aleatorio entre 500k y 5M
      return 500000 + Math.random() * 4500000;
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      return 0;
    }
  }

  /**
   * Generar ID de transacción único
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Validar datos de viajero
   */
  validateTravelerData(travelerInfo: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar documento
    if (!travelerInfo.documento || travelerInfo.documento.length < 6) {
      errors.push('Documento inválido');
    }

    // Validar nombres y apellidos
    if (!travelerInfo.nombres || travelerInfo.nombres.trim().length < 2) {
      errors.push('Nombres inválidos');
    }
    if (!travelerInfo.apellidos || travelerInfo.apellidos.trim().length < 2) {
      errors.push('Apellidos inválidos');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!travelerInfo.email || !emailRegex.test(travelerInfo.email)) {
      errors.push('Email inválido');
    }

    // Validar teléfonos
    const phoneRegex = /^\d{10}$/;
    if (!travelerInfo.telefono || !phoneRegex.test(travelerInfo.telefono)) {
      errors.push('Teléfono inválido (debe tener 10 dígitos)');
    }
    if (!travelerInfo.telefonoContacto || !phoneRegex.test(travelerInfo.telefonoContacto)) {
      errors.push('Teléfono de contacto inválido (debe tener 10 dígitos)');
    }

    // Validar fecha de nacimiento
    if (!travelerInfo.fechaNacimiento) {
      errors.push('Fecha de nacimiento requerida');
    } else {
      const birthDate = new Date(travelerInfo.fechaNacimiento);
      const today = new Date();
      if (birthDate >= today) {
        errors.push('Fecha de nacimiento inválida');
      }
    }

    // Validar género
    if (!['M', 'F', 'Otro'].includes(travelerInfo.genero)) {
      errors.push('Género inválido');
    }

    // Validar contacto de emergencia
    if (!travelerInfo.nombreContacto || travelerInfo.nombreContacto.trim().length < 2) {
      errors.push('Nombre de contacto de emergencia requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcular total del checkout
   */
  calculateTotal(items: any[]): number {
    return items.reduce((total, item) => {
      // Aquí deberías calcular según la clase y el precio del vuelo
      return total + (item.precioUnitario * item.cantidadTickets);
    }, 0);
  }
}

export const checkoutService = new CheckoutService();