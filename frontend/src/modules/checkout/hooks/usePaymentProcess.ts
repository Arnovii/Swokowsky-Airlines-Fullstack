import { useState, useCallback } from 'react';
import checkoutService from '../services/checkoutService';
import type { PaymentResult, CheckoutPayload } from '../types/checkout';
import { toast } from 'react-toastify';

export const usePaymentProcess = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * Procesar pago completo con el servicio de checkout
   */
  const processPayment = useCallback(async (
    checkoutPayload: CheckoutPayload
  ): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando proceso de pago...');
      
      // Llamar al servicio de checkout
      const result = await checkoutService.processCheckout(checkoutPayload);
      
      setPaymentResult(result);
      setShowModal(true);
      
      if (result.success) {
        console.log('✅ Pago procesado exitosamente:', result);
        toast.success(result.message || '¡Reserva realizada con éxito!', {
          position: 'top-center',
          autoClose: 3000
        });
      } else {
        console.error('❌ Error en el pago:', result.message);
        toast.error(result.message || 'Error al procesar el pago', {
          position: 'top-center',
          autoClose: 5000
        });
      }
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Error inesperado en processPayment:', error);
      
      const errorResult: PaymentResult = {
        success: false,
        message: error.message || 'Error al procesar el pago. Por favor intenta nuevamente.'
      };
      
      setPaymentResult(errorResult);
      setShowModal(true);
      
      toast.error(errorResult.message, {
        position: 'top-center',
        autoClose: 5000
      });
      
      return errorResult;
      
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Actualizar el resultado del pago manualmente (para casos especiales)
   */
  const setPaymentSuccess = useCallback((result: PaymentResult) => {
    setPaymentResult(result);
    setShowModal(true);
    
    toast.success(result.message || '¡Operación exitosa!', {
      position: 'top-center',
      autoClose: 3000
    });
  }, []);

  /**
   * Actualizar el resultado con un error manualmente
   */
  const setPaymentError = useCallback((errorMessage: string) => {
    const errorResult: PaymentResult = {
      success: false,
      message: errorMessage
    };
    
    setPaymentResult(errorResult);
    setShowModal(true);
    
    toast.error(errorMessage, {
      position: 'top-center',
      autoClose: 5000
    });
  }, []);

  /**
   * Cerrar el modal
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
    // No limpiar paymentResult aquí para mantener el estado
  }, []);

  /**
   * Resetear todo el estado del pago
   */
  const resetPayment = useCallback(() => {
    setPaymentResult(null);
    setShowModal(false);
    setIsProcessing(false);
  }, []);

  /**
   * Verificar si el pago fue exitoso
   */
  const isPaymentSuccessful = useCallback(() => {
    return paymentResult?.success === true;
  }, [paymentResult]);

  return {
    isProcessing,
    paymentResult,
    showModal,
    processPayment,
    setPaymentSuccess,
    setPaymentError,
    closeModal,
    resetPayment,
    isPaymentSuccessful
  };
};