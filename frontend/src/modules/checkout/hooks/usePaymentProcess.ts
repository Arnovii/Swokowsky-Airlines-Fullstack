// src/modules/checkout/hooks/usePaymentProcess.ts

import { useState, useCallback } from 'react';
import type { PaymentResult } from '../../../types/checkout';

export const usePaymentProcess = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * Procesar pago - Ahora solo maneja el estado del modal
   * La lógica de checkout real se maneja en CheckoutPage con checkoutService.submitCheckout()
   */
  const processPayment = useCallback(async (
    checkoutData: any[],
    totalAmount: number
  ): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      // Simular delay de procesamiento para mostrar loading (1-2 segundos)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Este resultado será sobrescrito por CheckoutPage después de la llamada real al backend
      // Solo lo usamos como placeholder mientras se procesa
      const result: PaymentResult = {
        success: true,
        message: 'Procesando tu pago...'
      };

      setPaymentResult(result);
      setShowModal(true);
      
      return result;
    } catch (error) {
      const errorResult: PaymentResult = {
        success: false,
        message: 'Error al procesar el pago. Por favor intenta nuevamente.'
      };
      
      setPaymentResult(errorResult);
      setShowModal(true);
      
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Actualizar el resultado del pago después de la respuesta del backend
   */
  const setPaymentSuccess = useCallback((result: PaymentResult) => {
    setPaymentResult(result);
    setShowModal(true);
  }, []);

  /**
   * Actualizar el resultado con un error
   */
  const setPaymentError = useCallback((errorMessage: string) => {
    const errorResult: PaymentResult = {
      success: false,
      message: errorMessage
    };
    setPaymentResult(errorResult);
    setShowModal(true);
  }, []);

  /**
   * Cerrar el modal
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  /**
   * Resetear todo el estado del pago
   */
  const resetPayment = useCallback(() => {
    setPaymentResult(null);
    setShowModal(false);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    paymentResult,
    showModal,
    processPayment,
    setPaymentSuccess,
    setPaymentError,
    closeModal,
    resetPayment
  };
};