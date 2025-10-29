import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook de auth
import cartService from '../modules/carrito/service/cartService';
import type { AddCartItemDto, CartItem } from '../modules/carrito/service/cartService';

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
  const { user, isAuthenticated } = useAuth(); // Usar el contexto de autenticación
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      // Si no hay usuario, limpiar el carrito
      setCart([]);
    }
    // eslint-disable-next-line
  }, [user?.id_usuario, isAuthenticated]); // Recargar cuando cambia el usuario

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

  const addToCart = async (item: AddCartItemDto) => {
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    setLoading(true);
    try {
      await cartService.addItem(item);
      await refreshCart();
    } catch (error) {
      console.error('Error al agregar item:', error);
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