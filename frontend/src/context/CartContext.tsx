import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartTicket } from './types';

interface CartContextType {
  cart: CartTicket[];
  addToCart: (ticket: CartTicket) => void;
  removeFromCart: (ticketId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartTicket[]>([]);

  const addToCart = (ticket: CartTicket) => {
    setCart((prev) => [...prev, ticket]);
  };

  const removeFromCart = (ticketId: string) => {
    setCart((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
