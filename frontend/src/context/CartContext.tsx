import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito al montar
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line
  }, []);

  const refreshCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data.items);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: AddCartItemDto) => {
    setLoading(true);
    try {
      await cartService.addItem(item);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    setLoading(true);
    try {
      await cartService.removeItem(itemId);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      // Eliminar todos los items uno a uno
      await Promise.all(cart.map((item) => cartService.removeItem(item.id_item_carrito)));
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };


  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, refreshCart, loading }}>

      {children}
    </CartContext.Provider>
  );
}
