// src/utils/flightUtils.ts

// Importa los tipos desde el archivo principal
import type { Flight } from '../types/Flight';

// Re-exporta Promotion para compatibilidad
export interface Promotion {
  name: string;
  discount: number;
  remainingSeats?: number;
}

export interface FlightFilters {
  precio: { min: number; max: number };
  horaSalida: string[];
  clase: string[];
  soloPromociones: boolean;
}

export type SortBy = 'precio' | 'duracion' | 'salida';

export const FlightUtils = {
  filterFlights: (flights: Flight[], filters: FlightFilters): Flight[] => {
    return flights.filter(flight => {
      const finalPrice = FlightUtils.calculateFinalPrice(flight);
      if (filters.precio.min > 0 && finalPrice < filters.precio.min) return false;
      if (filters.precio.max > 0 && finalPrice > filters.precio.max) return false;

      if (filters.horaSalida.length > 0) {
        const departureTime = flight.departureTimeUTC || flight.salidaProgramadaUtc;
        if (!departureTime) return false;
        const departureHour = new Date(departureTime).getUTCHours();
        const matchesHour = filters.horaSalida.some(slot => {
          if (slot === 'manana') return departureHour >= 5 && departureHour < 12;
          if (slot === 'tarde') return departureHour >= 12 && departureHour < 18;
          if (slot === 'noche') return departureHour >= 18 || departureHour < 5;
          return false;
        });
        if (!matchesHour) return false;
      }

      if (filters.soloPromociones && !flight.promotion) {
        return false;
      }

      return true;
    });
  },

  formatTime: (datetime: string): string => {
    return new Date(datetime).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    });
  },

  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  },

  calculateFinalPrice: (flight: Flight): number => {
    const basePrice = flight.price ?? flight.precioEconomica ?? 0;
    // Verifica que la promoción exista Y tenga asientos disponibles
    if (flight.promotion && (flight.promotion.remainingSeats ?? 0) > 0) {
      const discount = flight.promotion.discount;
      const finalPrice = basePrice * (1 - discount);
      console.log('🎯 Aplicando promoción:', {
        precioOriginal: basePrice,
        descuento: discount,
        precioFinal: Math.round(finalPrice)
      });
      return Math.round(finalPrice);
    }
    return Math.round(basePrice);
  },

  sortFlights: (flights: Flight[], sortBy: SortBy): Flight[] => {
    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'precio':
          return FlightUtils.calculateFinalPrice(a) - FlightUtils.calculateFinalPrice(b);
        case 'duracion':
          return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
        case 'salida': {
          const aTime = a.departureTimeUTC || a.salidaProgramadaUtc || '';
          const bTime = b.departureTimeUTC || b.salidaProgramadaUtc || '';
          return new Date(aTime).getTime() - new Date(bTime).getTime();
        }
        default:
          return 0;
      }
    });
  },

  getActiveFiltersCount: (filters: FlightFilters): number => {
    let count = 0;
    if (filters.precio.min > 0 || filters.precio.max > 0) count++;
    if (filters.horaSalida.length > 0) count++;
    if (filters.clase.length > 0) count++;
    if (filters.soloPromociones) count++;
    return count;
  }
};