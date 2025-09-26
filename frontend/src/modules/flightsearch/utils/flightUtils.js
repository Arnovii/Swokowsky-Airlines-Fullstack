// src/utils/flightUtils.js

export const FlightUtils = {
  // Ahora solo trabaja con propiedades consistentes: price, departureTimeUTC, etc.
  filterFlights: (flights, filters) => {
    return flights.filter(flight => {
      // Filtro de precio
      const finalPrice = FlightUtils.calculateFinalPrice(flight);
      if (filters.precio.min > 0 && finalPrice < filters.precio.min) return false;
      if (filters.precio.max > 0 && finalPrice > filters.precio.max) return false;

      // Filtro de horario (usando getUTCHours para evitar errores de zona horaria)
      if (filters.horaSalida.length > 0) {
        const departureHour = new Date(flight.departureTimeUTC).getUTCHours();
        const matchesHour = filters.horaSalida.some(slot => {
          if (slot === 'manana') return departureHour >= 5 && departureHour < 12;
          if (slot === 'tarde') return departureHour >= 12 && departureHour < 18;
          if (slot === 'noche') return departureHour >= 18 || departureHour < 5;
          return false;
        });
        if (!matchesHour) return false;
      }
      
      // Filtro de promociones
      if (filters.soloPromociones && !flight.promotion) {
        return false;
      }
      
      // Si pasa todos los filtros, se incluye
      return true;
    });
  },

  // Formatea la hora local para mostrar al usuario
  formatTime: (datetime) => {
    return new Date(datetime).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true, // A menudo es más amigable para el usuario
      timeZone: 'America/Bogota' // Especificar la zona horaria es más seguro
    });
  },

  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  formatPrice: (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  },

  // El cálculo ahora es más simple y directo
  calculateFinalPrice: (flight) => {
    if (flight.promotion) {
      return flight.price * (1 - flight.promotion.discount);
    }
    return flight.price;
  },

  // El ordenamiento también se simplifica
  sortFlights: (flights, sortBy) => {
    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'precio':
          return FlightUtils.calculateFinalPrice(a) - FlightUtils.calculateFinalPrice(b);
        case 'duracion':
          return a.durationMinutes - b.durationMinutes;
        case 'salida':
          return new Date(a.departureTimeUTC) - new Date(b.departureTimeUTC);
        default:
          return 0;
      }
    });
  },

  // Esta función no cambia, ¡ya estaba perfecta!
  getActiveFiltersCount: (filters) => {
    let count = 0;
    if (filters.precio.min > 0 || filters.precio.max > 0) count++;
    if (filters.horaSalida.length > 0) count++;
    if (filters.clase.length > 0) count++;
    if (filters.soloPromociones) count++;
    return count;
  }
};