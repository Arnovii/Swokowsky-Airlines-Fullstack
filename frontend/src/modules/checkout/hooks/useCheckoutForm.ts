import { useState, useCallback, useMemo , useEffect} from 'react';
import type { CartItem } from '../../carrito/service/cartService';
import type { Pasajero, CheckoutPayload } from '../types/checkout';
import type { TravelerFormData } from '../components/TravelerForm';
import { validateTravelerForm, mapTravelerToApi } from '../utils/validations';

/**
 * Crear un objeto TravelerFormData vacío
 */
const createEmptyTraveler = (): TravelerFormData => ({
  numero_documento: '',
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  fecha_nacimiento: '',
  genero: 'M',
  nacionalidad: '',
  email: '',
  telefono: '',
  contacto_nombre: '',
  contacto_telefono: ''
});

export const useCheckoutForm = (cart: CartItem[]) => {
  // Estado: objeto con claves únicas por pasajero
  // Formato: { "itemId-passengerIndex": TravelerFormData }
  const [travelers, setTravelers] = useState<Record<string, TravelerFormData>>({});

  useEffect(() => {
    if (cart && cart.length > 0) {
      const initialTravelers: Record<string, TravelerFormData> = {};
      cart.forEach(item => {
        for (let i = 0; i < item.cantidad_de_tickets; i++) {
          const key = `${item.id_item_carrito}-${i}`;
          initialTravelers[key] = createEmptyTraveler();
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
  const updateTravelerInfo = useCallback((key: string, data: TravelerFormData) => {
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
      validateTravelerForm(traveler)
    ).length;
    
    return completedForms === totalForms && totalForms > 0;
  }, [travelers, totalForms]);

  /**
   * Obtener conteo de formularios completos
   */
  const getCompletedCount = useCallback(() => {
    return Object.values(travelers).filter(traveler => 
      validateTravelerForm(traveler)
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

      // Mapear TravelerFormData a Pasajero (formato API)
      const pasajeros: Pasajero[] = passengerKeys
        .sort() // Ordenar para mantener consistencia
        .map(key => mapTravelerToApi(travelers[key]));

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

    return passengerKeys.every(key => validateTravelerForm(travelers[key]));
  }, [travelers]);

  /**
   * Obtener un pasajero específico
   */
  const getTraveler = useCallback((key: string): TravelerFormData => {
    return travelers[key] || createEmptyTraveler();
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
    return allFormsComplete;
  }, [allFormsComplete]);

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