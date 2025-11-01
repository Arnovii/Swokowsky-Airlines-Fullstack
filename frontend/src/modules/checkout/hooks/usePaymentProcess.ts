// src/modules/checkout/hooks/usePaymentProcess.ts

import { useState, useCallback } from 'react';
import type { PaymentResult } from '../../../types/checkout';
import { checkoutService } from '../services/checkoutService';

export const usePaymentProcess = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const processPayment = useCallback(async (
    checkoutData: any[],
    totalAmount: number
  ): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      // Simular delay de procesamiento (2-3 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      // Llamar al servicio de checkout (actualmente simulado)
      const result = await checkoutService.processPayment({
        items: checkoutData,
        totalAmount
      });

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

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

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
    closeModal,
    resetPayment
  };
};