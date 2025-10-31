// src/modules/checkout/hooks/useCheckoutForm.ts

import { useState, useCallback, useEffect } from 'react';
import type { TravelerInfo, FlightCheckoutData } from '../../../types/checkout';
import type { CartItem } from '../../carrito/service/cartService';
import { validateTravelerInfo } from '../utils/validations';

const createEmptyTravelerInfo = (): TravelerInfo => ({
  documento: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: '',
  telefono: '',
  email: '',
  contacto_emergencia_nombre: '', // ✅ Cambiado de contacto_nombre
  contacto_emergencia_telefono: '' // ✅ Cambiado de contacto_telefono
});

export const useCheckoutForm = (cartItems: CartItem[]) => {
  const [flightCheckoutData, setFlightCheckoutData] = useState<FlightCheckoutData[]>([]);

  // Inicializar datos de checkout cuando cambie el carrito
  useEffect(() => {
    const initialData: FlightCheckoutData[] = cartItems.map(item => ({
      id_vuelo: item.id_vueloFK,
      travelerInfoList: Array.from({ length: item.cantidad_de_tickets }, () => createEmptyTravelerInfo()),
      isComplete: false
    }));
    setFlightCheckoutData(initialData);
  }, [cartItems.length]);

  // Actualizar información de un viajero específico
  const updateTravelerInfo = useCallback((flightIndex: number, travelerIndex: number, info: TravelerInfo) => {
    setFlightCheckoutData(prev => {
      const newData = [...prev];
      const flight = newData[flightIndex];
      
      // Actualizar el pasajero específico
      flight.travelerInfoList[travelerIndex] = info;
      
      // Verificar si todos los pasajeros del vuelo están completos
      const allTravelersComplete = flight.travelerInfoList.every(t => validateTravelerInfo(t));
      flight.isComplete = allTravelersComplete;
      
      return newData;
    });
  }, []);

  // Verificar si todos los formularios están completos
  const allFormsComplete = useCallback(() => {
    return flightCheckoutData.length > 0 && 
           flightCheckoutData.every(data => data.isComplete);
  }, [flightCheckoutData]);

  // Obtener conteo de formularios completos
  const getCompletedCount = useCallback(() => {
    return flightCheckoutData.filter(data => data.isComplete).length;
  }, [flightCheckoutData]);

  // Obtener datos de checkout preparados para enviar
  const getCheckoutData = useCallback(() => {
    return flightCheckoutData.map((data, index) => ({
      cartItemId: cartItems[index].id_item_carrito,
      flightId: data.id_vuelo,
      clase: cartItems[index].clase,
      cantidadTickets: cartItems[index].cantidad_de_tickets,
      travelerInfo: data.travelerInfoList
    }));
  }, [flightCheckoutData, cartItems]);

  // Calcular total de formularios (pasajeros)
  const totalForms = flightCheckoutData.reduce((total, flight) => 
    total + flight.travelerInfoList.length, 0
  );

  return {
    flightCheckoutData,
    updateTravelerInfo,
    allFormsComplete,
    getCompletedCount,
    getCheckoutData,
    totalForms
  };
};