import { useState, useCallback, useMemo , useEffect} from 'react';
import type { CartItem } from '../../carrito/service/cartService';
import type { Pasajero, CheckoutPayload } from '../types/checkout';
import { validatePasajero } from '../utils/validations';

/**
 * Crear un objeto Pasajero vacío
 */
const createEmptyPasajero = (): Pasajero => ({
  nombre: '',
  apellido: '',
  dni: '',
  phone: '',
  email: '',
  contact_name: null,
  phone_name: null,
  genero: 'M',
  fecha_nacimiento: ''
});

export const useCheckoutForm = (cart: CartItem[]) => {
  // Estado: objeto con claves únicas por pasajero
  // Formato: { "itemId-passengerIndex": Pasajero }
  const [travelers, setTravelers] = useState<Record<string, Pasajero>>({});

  useEffect(() => {
    if (cart && cart.length > 0) {
      const initialTravelers: Record<string, Pasajero> = {};
      cart.forEach(item => {
        for (let i = 0; i < item.cantidad_de_tickets; i++) {
          const key = `${item.id_item_carrito}-${i}`;
          initialTravelers[key] = createEmptyPasajero();
        }
      });
      setTravelers(initialTravelers);
    }
  }, [cart]);

  /**
   * Total de formularios (suma de todos los pasajeros de todos los vuelos)
   */
  const totalForms = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.cantidad_de_tickets, 0);
  }, [cart]);

  /**
   * Actualizar información de un pasajero específico
   */
  const updateTravelerInfo = useCallback((key: string, data: Pasajero) => {
    setTravelers(prev => ({
      ...prev,
      [key]: data
    }));
  }, []);

  /**
   * Verificar si todos los formularios están completos
   */
  const allFormsComplete = useMemo(() => {
    const completedForms = Object.values(travelers).filter(traveler => 
      validatePasajero(traveler)
    ).length;
    
    return completedForms === totalForms && totalForms > 0;
  }, [travelers, totalForms]);

  /**
   * Obtener conteo de formularios completos
   */
  const getCompletedCount = useCallback(() => {
    return Object.values(travelers).filter(traveler => 
      validatePasajero(traveler)
    ).length;
  }, [travelers]);

  /**
   * Obtener datos de checkout en formato CheckoutPayload
   * Formato esperado por el backend: { item1: {...}, item2: {...}, ... }
   */
  const getCheckoutData = useCallback((): CheckoutPayload => {
    const payload: CheckoutPayload = {};
    let itemIndex = 1;

    cart.forEach(cartItem => {
      // Obtener todos los pasajeros de este item del carrito
      const passengerKeys = Object.keys(travelers).filter(key => 
        key.startsWith(`${cartItem.id_item_carrito}-`)
      );

      const pasajeros: Pasajero[] = passengerKeys
        .sort() // Ordenar para mantener consistencia
        .map(key => travelers[key]);

      // Solo agregar si hay pasajeros
      if (pasajeros.length > 0) {
        payload[`item${itemIndex}`] = {
          vueloID: cartItem.id_vueloFK,
          Clase: cartItem.clase,
          CantidadDePasajeros: cartItem.cantidad_de_tickets,
          pasajeros
        };
        itemIndex++;
      }
    });

    return payload;
  }, [cart, travelers]);

  /**
   * Verificar si un item específico del carrito está completo
   */
  const isItemComplete = useCallback((cartItemId: number, expectedPassengers: number) => {
    const passengerKeys = Object.keys(travelers).filter(key => 
      key.startsWith(`${cartItemId}-`)
    );

    if (passengerKeys.length !== expectedPassengers) {
      return false;
    }

    return passengerKeys.every(key => validatePasajero(travelers[key]));
  }, [travelers]);

  /**
   * Obtener un pasajero específico
   */
  const getTraveler = useCallback((key: string): Pasajero => {
    return travelers[key] || createEmptyPasajero();
  }, [travelers]);

  /**
   * Limpiar todos los formularios
   */
  const clearAllForms = useCallback(() => {
    setTravelers({});
  }, []);

  /**
   * Validar si el payload está listo para enviar
   */
  const isReadyForCheckout = useCallback((): boolean => {
    const payload = getCheckoutData();
    const itemKeys = Object.keys(payload) as Array<keyof CheckoutPayload>;
    
    if (itemKeys.length === 0) return false;

    return itemKeys.every(key => {
      const item = payload[key];
      return item.pasajeros.every(p => validatePasajero(p));
    });
  }, [getCheckoutData]);

  return {
    travelers,
    updateTravelerInfo,
    allFormsComplete,
    getCompletedCount,
    getCheckoutData,
    totalForms,
    isItemComplete,
    getTraveler,
    clearAllForms,
    isReadyForCheckout
  };
};