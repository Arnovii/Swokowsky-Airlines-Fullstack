
// EN TU CartContext.tsx:

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import cartService from '../modules/carrito/service/cartService';
import type { AddCartItemDto, CartItem } from '../modules/carrito/service/cartService';
import { toast } from 'react-toastify'; // ← IMPORTAR TOAST

interface CartProviderProps {
  children: ReactNode;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: AddCartItemDto) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      setCart([]);
    }
  }, [user?.id_usuario, isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated || !user) {
      setCart([]);
      return;
    }

    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data.items || []);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: {
    id_vueloFK: number;
    cantidad_de_tickets: number;
    clase: 'economica' | 'primera_clase';
  }) => {
    try {
      // Calcular tickets totales del mismo vuelo (todas las clases combinadas)
      const existingTicketsForFlight = cart.reduce((total, cartItem) => {
        if (cartItem.id_vueloFK === item.id_vueloFK) {
          return total + cartItem.cantidad_de_tickets;
        }
        return total;
      }, 0);

      const totalTicketsAfterAdd = existingTicketsForFlight + item.cantidad_de_tickets;

      // Si excede 5 tickets en total para este vuelo
      if (totalTicketsAfterAdd > 5) {
        const available = 5 - existingTicketsForFlight;
        
        // MOSTRAR TOAST DE ERROR
        if (available > 0) {
          toast.error(
            ` Solo puedes agregar ${available} ticket${available > 1 ? 's' : ''} más. Ya tienes ${existingTicketsForFlight} en tu carrito para este vuelo.`,
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        } else {
          toast.error(
            ' Ya tienes el límite de 5 tickets para este vuelo en tu carrito.',
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
        
        // LANZAR ERROR PARA QUE handleClassSelection LO CAPTURE
        throw new Error('Límite de tickets excedido');
      }

      setLoading(true);
      await cartService.addItem(item);
      await refreshCart();
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      
      // Solo mostrar toast si NO es el error de límite (ya se mostró arriba)
      if (error instanceof Error && error.message !== 'Límite de tickets excedido') {
        toast.error(
          'Hubo un problema al agregar los tickets. Intenta de nuevo.',
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      }
      
      // RE-LANZAR EL ERROR para que handleClassSelection lo capture
      throw error;
      
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    setLoading(true);
    try {
      await cartService.removeItem(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error al eliminar item:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await Promise.all(cart.map((item) => cartService.removeItem(item.id_item_carrito)));
      await refreshCart();
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
