// src/modules/checkout/hooks/useCheckoutForm.ts

import { useState, useCallback, useEffect } from 'react';
import type { TravelerInfo, FlightCheckoutData } from '../../../types/checkout';
import type { CartItem } from '../../carrito/service/cartService';

const createEmptyTravelerInfo = (): TravelerInfo => ({
  documento: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  genero: 'M',
  telefono: '',
  email: '',
  nombreContacto: '',
  telefonoContacto: ''
});

export const useCheckoutForm = (cartItems: CartItem[]) => {
  const [flightCheckoutData, setFlightCheckoutData] = useState<FlightCheckoutData[]>([]);
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);

  // Inicializar datos de checkout cuando cambie el carrito
  useEffect(() => {
    const initialData: FlightCheckoutData[] = cartItems.map(item => ({
      ticketId: `ticket-${item.id_item_carrito}`,
      flightId: item.id_vueloFK,
      travelerInfo: createEmptyTravelerInfo(),
      isComplete: false
    }));
    setFlightCheckoutData(initialData);
  }, [cartItems.length]); // Solo cuando cambie la cantidad de items

  // Validar si un formulario de viajero está completo
  const validateTravelerInfo = useCallback((info: TravelerInfo): boolean => {
    const requiredFields: (keyof TravelerInfo)[] = [
      'documento',
      'nombres',
      'apellidos',
      'fechaNacimiento',
      'genero',
      'telefono',
      'email',
      'nombreContacto',
      'telefonoContacto'
    ];

    // Verificar que todos los campos requeridos estén llenos
    const allFieldsFilled = requiredFields.every(field => {
      const value = info[field];
      return value !== null && value !== undefined && value.toString().trim() !== '';
    });

    if (!allFieldsFilled) return false;

    // Validaciones específicas
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(info.email)) return false;

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(info.telefono) || !phoneRegex.test(info.telefonoContacto)) return false;

    if (info.documento.length < 6) return false;

    return true;
  }, []);

  // Actualizar información de un viajero específico
  const updateTravelerInfo = useCallback((flightIndex: number, info: TravelerInfo) => {
    setFlightCheckoutData(prev => {
      const newData = [...prev];
      const isComplete = validateTravelerInfo(info);
      
      newData[flightIndex] = {
        ...newData[flightIndex],
        travelerInfo: info,
        isComplete
      };
      
      return newData;
    });
  }, [validateTravelerInfo]);

  // Verificar si todos los formularios están completos
  const allFormsComplete = useCallback(() => {
    return flightCheckoutData.length > 0 && 
           flightCheckoutData.every(data => data.isComplete);
  }, [flightCheckoutData]);

  // Obtener conteo de formularios completos
  const getCompletedCount = useCallback(() => {
    return flightCheckoutData.filter(data => data.isComplete).length;
  }, [flightCheckoutData]);

  // Navegar a un formulario específico
  const goToFlight = useCallback((index: number) => {
    if (index >= 0 && index < flightCheckoutData.length) {
      setCurrentFlightIndex(index);
    }
  }, [flightCheckoutData.length]);

  // Obtener datos de checkout preparados para enviar
  const getCheckoutData = useCallback(() => {
    return flightCheckoutData.map((data, index) => ({
      cartItemId: cartItems[index].id_item_carrito,
      flightId: data.flightId,
      clase: cartItems[index].clase,
      cantidadTickets: cartItems[index].cantidad_de_tickets,
      travelerInfo: data.travelerInfo
    }));
  }, [flightCheckoutData, cartItems]);

  return {
    flightCheckoutData,
    currentFlightIndex,
    updateTravelerInfo,
    allFormsComplete,
    getCompletedCount,
    goToFlight,
    getCheckoutData,
    totalForms: flightCheckoutData.length
  };
};