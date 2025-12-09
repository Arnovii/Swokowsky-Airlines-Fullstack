import api from '../../../api/axios';

export interface SeatMapResponse {
  [seatCode: string]: 'Disponible' | 'Ocupado (vendido)' | 'Ocupado (asignado)';
}

export const seatService = {
  /**
   * Obtener el mapa de asientos de un vuelo
   * @param idVuelo - ID del vuelo
   * @returns Mapa de asientos con su estado
   */
  async getSeatsForFlight(idVuelo: number): Promise<SeatMapResponse> {
    const response = await api.get<SeatMapResponse>(`/checkin/asientos/${idVuelo}`);
    return response.data;
  },

  /**
   * Convierte la respuesta del backend a un array de IDs de asientos ocupados
   * para usar con el componente SeatMap
   */
  getOccupiedSeatsFromResponse(seatMap: SeatMapResponse): string[] {
    return Object.entries(seatMap)
      .filter(([_, status]) => status !== 'Disponible')
      .map(([seatCode]) => seatCode);
  },

  /**
   * Convierte el código de asiento del backend (P-1, E-1) al formato del frontend (1A, 1B, etc.)
   * P = Primera clase, E = Económica
   */
  convertBackendToFrontendSeatCode(backendCode: string): string {
    // El backend usa formato: P-1, P-2, E-1, E-2, etc.
    // El frontend usa formato: 1A, 1B, 2A, etc.
    const match = backendCode.match(/^([PE])-(\d+)$/);
    if (!match) return backendCode;

    const [, clase, num] = match;
    const seatNum = parseInt(num, 10);
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    // Calcular fila y columna
    const row = Math.floor((seatNum - 1) / 6) + 1;
    const colIndex = (seatNum - 1) % 6;
    const column = columns[colIndex];
    
    // Si es primera clase, ajustar la fila
    if (clase === 'P') {
      return `${row}${column}`;
    } else {
      // Para económica, las filas empiezan después de primera clase
      // Esto depende de tu configuración específica
      return `${row}${column}`;
    }
  },

  /**
   * Procesa la respuesta del backend y devuelve los asientos ocupados
   * en el formato que espera el componente SeatMap
   */
  processBackendResponse(seatMap: SeatMapResponse): string[] {
    const occupiedSeats: string[] = [];
    
    for (const [seatCode, status] of Object.entries(seatMap)) {
      if (status !== 'Disponible') {
        // El código ya viene en formato del backend, lo convertimos si es necesario
        occupiedSeats.push(seatCode);
      }
    }
    
    return occupiedSeats;
  }
};

export default seatService;
