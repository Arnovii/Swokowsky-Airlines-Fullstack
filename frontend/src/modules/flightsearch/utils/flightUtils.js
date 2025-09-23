export const FlightUtils = {
  formatTime: (datetime) => {
    return new Date(datetime).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
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

  calculateFinalPrice: (flight) => {
    if (flight.promocion && flight.promocion.cupoRestante > 0) {
      return flight.precio_base * (1 - flight.promocion.descuento_pet);
    }
    return flight.precio_base;
  },

  sortFlights: (flights, sortBy) => {
    return [...flights].sort((a, b) => {
      if (sortBy === 'precio') {
        const priceA = FlightUtils.calculateFinalPrice(a);
        const priceB = FlightUtils.calculateFinalPrice(b);
        return priceA - priceB;
      }
      if (sortBy === 'duracion') {
        return a.duracion_minutos - b.duracion_minutos;
      }
      if (sortBy === 'salida') {
        return new Date(a.salida_programada) - new Date(b.salida_programada);
      }
      return 0;
    });
  },

  getActiveFiltersCount: (filters) => {
    let count = 0;
    if (filters.precio.min > 0 || filters.precio.max > 0) count++;
    if (filters.horaSalida.length > 0) count += filters.horaSalida.length;
    if (filters.clase.length > 0) count += filters.clase.length;
    if (filters.soloPromociones) count++;
    return count;
  }
};
