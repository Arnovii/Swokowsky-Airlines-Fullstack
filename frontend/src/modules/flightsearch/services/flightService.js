export class FlightService {
  static BASE_URL = '/api/flights'; // Cambia por tu URL real

  static async searchFlights(searchCriteria, filters) {
    try {
      const queryParams = new URLSearchParams({
        origen: searchCriteria.origen,
        destino: searchCriteria.destino,
        fecha: searchCriteria.fecha,
        ...(searchCriteria.fechaVuelta && { fechaVuelta: searchCriteria.fechaVuelta }),
        pasajeros: searchCriteria.pasajeros.toString(),
        adultos: searchCriteria.adultos.toString(),
        menores: searchCriteria.menores.toString(),
        modo: searchCriteria.modo,
        // Filtros
        ...(filters.precio.min > 0 && { precioMin: filters.precio.min.toString() }),
        ...(filters.precio.max > 0 && { precioMax: filters.precio.max.toString() }),
        ...(filters.horaSalida.length > 0 && { horaSalida: filters.horaSalida.join(',') }),
        ...(filters.clase.length > 0 && { clase: filters.clase.join(',') }),
        ...(filters.soloPromociones && { soloPromociones: 'true' })
      });

      const response = await fetch(`${this.BASE_URL}/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        flights: data.flights || [],
        total: data.total || 0,
        filters: data.availableFilters || {},
        metadata: data.metadata || {}
      };
    } catch (error) {
      // Para desarrollo, simular datos
      console.warn('API no disponible, usando datos simulados:', error.message);
      return this.getMockData(searchCriteria, filters);
    }
  }

  static async getFlightDetails(flightId) {
    try {
      const response = await fetch(`${this.BASE_URL}/${flightId}`);
      if (!response.ok) throw new Error('Error al obtener detalles del vuelo');
      return await response.json();
    } catch (error) {
      console.error('Error getting flight details:', error);
      throw error;
    }
  }

  // Datos mock para desarrollo
  static getMockData(searchCriteria, filters) {
    // Simular delay de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          flights: [], // Array vacío para desarrollo
          total: 0,
          metadata: {
            searchTime: '150ms',
            page: 1,
            totalPages: 0
          },
          filters: {}
        });
      }, 800);
    });
  }
}