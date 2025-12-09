import api from '../../../api/axios';

// Tipos de respuesta del backend
export interface PassengerInfo {
  nombre: string;
  dni: string;
  email: string;
}

export interface ValidateCheckinResponse {
  ticketId: number;
  id_vuelo: number;
  pasajero: PassengerInfo;
  asientoComprado: string | null;
  asientoAsignado: string | null;
  salida: string;
}

export interface SeatMapResponse {
  [seatCode: string]: 'Disponible' | 'Ocupado (vendido)' | 'Ocupado (asignado)';
}

export interface AssignSeatResponse {
  message: string;
  asientoAsignado: string;
}

export interface ConfirmCheckinResponse {
  message: string;
  ticketId: number;
  asiento: string;
}

// Datos guardados en localStorage durante el proceso de check-in
export interface CheckinSessionData {
  codigo_unico: string;
  ticketId: number;
  id_vuelo: number;
  pasajero: PassengerInfo;
  asientoComprado: string | null;
  asientoAsignado: string | null;
  salida: string;
  extraBag: boolean;
}

const CHECKIN_SESSION_KEY = 'checkin_session';

export const checkinService = {
  /**
   * Validar código de check-in y DNI
   * POST /checkin/validate
   */
  async validateCode(codigo_unico: string, dni: string): Promise<ValidateCheckinResponse> {
    const response = await api.post<ValidateCheckinResponse>('/checkin/validate', {
      codigo_unico,
      dni,
    });
    return response.data;
  },

  /**
   * Obtener mapa de asientos para un vuelo
   * GET /checkin/asientos/:id_vuelo
   */
  async getSeatsForFlight(id_vuelo: number): Promise<SeatMapResponse> {
    const response = await api.get<SeatMapResponse>(`/checkin/asientos/${id_vuelo}`);
    return response.data;
  },

  /**
   * Asignar asiento al ticket
   * POST /checkin/asignar-asiento
   */
  async assignSeat(codigo_unico: string, ticketId: number, asiento: string): Promise<AssignSeatResponse> {
    const response = await api.post<AssignSeatResponse>('/checkin/asignar-asiento', {
      codigo_unico,
      ticketId,
      asiento,
    });
    return response.data;
  },

  /**
   * Confirmar check-in
   * POST /checkin/confirmar
   */
  async confirmCheckin(codigo_unico: string, ticketId: number): Promise<ConfirmCheckinResponse> {
    const response = await api.post<ConfirmCheckinResponse>('/checkin/confirmar', {
      codigo_unico,
      ticketId,
    });
    return response.data;
  },

  /**
   * Convertir respuesta del backend a array de asientos ocupados
   */
  getOccupiedSeats(seatMap: SeatMapResponse): string[] {
    return Object.entries(seatMap)
      .filter(([, status]) => status !== 'Disponible')
      .map(([seatCode]) => seatCode);
  },

  /**
   * Obtener todos los asientos disponibles
   */
  getAvailableSeats(seatMap: SeatMapResponse): string[] {
    return Object.entries(seatMap)
      .filter(([, status]) => status === 'Disponible')
      .map(([seatCode]) => seatCode);
  },

  // ========== Manejo de sesión de check-in en localStorage ==========

  /**
   * Guardar datos de la sesión de check-in
   */
  saveSession(data: CheckinSessionData): void {
    localStorage.setItem(CHECKIN_SESSION_KEY, JSON.stringify(data));
  },

  /**
   * Obtener datos de la sesión de check-in
   */
  getSession(): CheckinSessionData | null {
    const data = localStorage.getItem(CHECKIN_SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as CheckinSessionData;
    } catch {
      return null;
    }
  },

  /**
   * Actualizar datos parciales de la sesión
   */
  updateSession(partialData: Partial<CheckinSessionData>): void {
    const current = this.getSession();
    if (current) {
      this.saveSession({ ...current, ...partialData });
    }
  },

  /**
   * Limpiar sesión de check-in
   */
  clearSession(): void {
    localStorage.removeItem(CHECKIN_SESSION_KEY);
  },
};

export default checkinService;
