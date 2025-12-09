// Componente de mapa de asientos para el flujo de check-in
// Usa el formato de asientos del backend: A1, B2, C3, D14, etc. (Letra + Número)

import { useState, useMemo } from 'react';
import type { SeatMapResponse } from '../../checkin/services/checkinService';

export interface CheckinSeat {
  id: string;        // A1, B2, D14, etc.
  column: string;    // A, B, C, D, E, F
  row: number;       // 1, 2, 3, etc.
  status: 'available' | 'occupied' | 'selected' | 'assigned'; // 'assigned' = asiento actual del pasajero
}

interface CheckinSeatMapProps {
  seatMap: SeatMapResponse;
  selectedSeat: string | null;
  currentAssignedSeat?: string | null; // Asiento asignado aleatoriamente durante la compra
  onSeatSelect: (seatId: string) => void;
  disabled?: boolean;
}

// Columnas del avión
const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'];

const CheckinSeatMap: React.FC<CheckinSeatMapProps> = ({
  seatMap,
  selectedSeat,
  currentAssignedSeat = null,
  onSeatSelect,
  disabled = false,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Procesar asientos del backend y organizar por filas
  const { seatRows, totalSeats } = useMemo(() => {
    const seatsByRow: Map<number, CheckinSeat[]> = new Map();
    let maxRowNum = 0;
    let totalCount = 0;

    // Parsear cada asiento del mapa
    Object.entries(seatMap).forEach(([seatId, status]) => {
      // Parsear formato A1, B14, etc.
      const match = seatId.match(/^([A-F])(\d+)$/);
      if (!match) return;

      const column = match[1];
      const row = parseInt(match[2], 10);
      maxRowNum = Math.max(maxRowNum, row);
      totalCount++;

      const seat: CheckinSeat = {
        id: seatId,
        column,
        row,
        status: selectedSeat === seatId 
          ? 'selected' 
          : currentAssignedSeat === seatId
            ? 'assigned'
            : status === 'Disponible' 
              ? 'available' 
              : 'occupied',
      };

      if (!seatsByRow.has(row)) {
        seatsByRow.set(row, []);
      }
      seatsByRow.get(row)!.push(seat);
    });

    // Ordenar asientos dentro de cada fila por columna
    seatsByRow.forEach((seats) => {
      seats.sort((a, b) => COLUMNS.indexOf(a.column) - COLUMNS.indexOf(b.column));
    });

    // Determinar filas de primera clase (aprox 25 asientos = 4-5 filas)
    // Nacional: 150 asientos total, 25 primera clase
    // Internacional: 250 asientos total, 50 primera clase
    const estimatedPrimera = totalCount <= 150 ? 25 : 50;
    const primeraMaxRow = Math.ceil(estimatedPrimera / 6);

    // Convertir a array ordenado
    const sortedRows = Array.from(seatsByRow.keys()).sort((a, b) => a - b);
    const rowsArray = sortedRows.map(rowNum => ({
      rowNum,
      seats: seatsByRow.get(rowNum)!,
      isPrimeraClase: rowNum <= primeraMaxRow
    }));

    return { 
      seatRows: rowsArray, 
      totalSeats: totalCount
    };
  }, [seatMap, selectedSeat, currentAssignedSeat]);

  const handleSeatClick = (seat: CheckinSeat) => {
    // Permitir seleccionar asientos disponibles O el asiento asignado actual
    if (disabled || seat.status === 'occupied') return;
    onSeatSelect(seat.id);
  };

  const getSeatStyle = (seat: CheckinSeat, isPrimeraClase: boolean) => {
    const baseStyle = "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer";
    
    if (seat.status === 'selected') {
      return `${baseStyle} bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110`;
    }
    // Asiento asignado al pasajero (verde con borde)
    if (seat.status === 'assigned') {
      return `${baseStyle} bg-green-500/30 border-2 border-green-400 text-green-200 hover:bg-green-500/50 ring-2 ring-green-400/50 ring-offset-1 ring-offset-slate-900`;
    }
    if (seat.status === 'occupied') {
      return `${baseStyle} bg-slate-600/50 text-slate-400 cursor-not-allowed`;
    }
    if (hoveredSeat === seat.id) {
      return `${baseStyle} bg-cyan-400 text-slate-900 scale-105`;
    }
    // Disponible
    if (isPrimeraClase) {
      return `${baseStyle} bg-amber-500/20 border-2 border-amber-400/50 text-amber-200 hover:bg-amber-500/40`;
    }
    return `${baseStyle} bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/40`;
  };

  const renderSeatRow = (rowData: { rowNum: number; seats: CheckinSeat[]; isPrimeraClase: boolean }) => {
    const { rowNum, seats, isPrimeraClase } = rowData;
    
    // Crear estructura completa de 6 columnas (A-F)
    const seatLookup = new Map(seats.map(s => [s.column, s]));
    const leftColumns = ['A', 'B', 'C'];
    const rightColumns = ['D', 'E', 'F'];

    return (
      <div key={`row-${rowNum}`} className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
        {/* Número de fila */}
        <span className="w-6 text-xs text-slate-400 text-right">{rowNum}</span>
        
        {/* Asientos izquierda (A-B-C) */}
        <div className="flex gap-1">
          {leftColumns.map((col) => {
            const seat = seatLookup.get(col);
            if (!seat) {
              // Espacio vacío si no existe el asiento
              return <div key={`empty-${rowNum}-${col}`} className="w-10 h-10 sm:w-12 sm:h-12"></div>;
            }
            return (
              <button
                key={seat.id}
                className={getSeatStyle(seat, isPrimeraClase)}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                disabled={disabled || seat.status === 'occupied'}
                title={`${seat.id} - ${seat.status === 'occupied' ? 'Ocupado' : 'Disponible'}`}
              >
                {seat.id}
              </button>
            );
          })}
        </div>

        {/* Pasillo */}
        <div className="w-6 sm:w-10"></div>

        {/* Asientos derecha (D-E-F) */}
        <div className="flex gap-1">
          {rightColumns.map((col) => {
            const seat = seatLookup.get(col);
            if (!seat) {
              return <div key={`empty-${rowNum}-${col}`} className="w-10 h-10 sm:w-12 sm:h-12"></div>;
            }
            return (
              <button
                key={seat.id}
                className={getSeatStyle(seat, isPrimeraClase)}
                onClick={() => handleSeatClick(seat)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                disabled={disabled || seat.status === 'occupied'}
                title={`${seat.id} - ${seat.status === 'occupied' ? 'Ocupado' : 'Disponible'}`}
              >
                {seat.id}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Separar filas de primera clase y económica
  const primeraClaseRows = seatRows.filter(r => r.isPrimeraClase);
  const economicaRows = seatRows.filter(r => !r.isPrimeraClase);

  // Contar asientos
  const primeraCount = primeraClaseRows.reduce((acc, r) => acc + r.seats.length, 0);
  const economicaCount = economicaRows.reduce((acc, r) => acc + r.seats.length, 0);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700/50">
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/20 border-2 border-cyan-400/50"></div>
          <span className="text-xs text-slate-300">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-600/50"></div>
          <span className="text-xs text-slate-300">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-500/30 border-2 border-green-400"></div>
          <span className="text-xs text-slate-300">Tu asiento actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500"></div>
          <span className="text-xs text-slate-300">Nueva selección</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 border-2 border-amber-400/50"></div>
          <span className="text-xs text-slate-300">Primera Clase</span>
        </div>
      </div>

      {/* Cabina del avión */}
      <div className="relative">
        {/* Frente del avión */}
        <div className="flex justify-center mb-4">
          <div className="px-6 py-2 bg-slate-800 rounded-t-3xl border-t-2 border-x-2 border-cyan-500/30">
            <span className="text-xs text-cyan-300 font-medium">✈️ FRENTE</span>
          </div>
        </div>

        {/* Encabezado de columnas */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
          <span className="w-6"></span>
          <div className="flex gap-1">
            {['A', 'B', 'C'].map(col => (
              <span key={col} className="w-10 sm:w-12 text-center text-xs text-slate-500 font-medium">{col}</span>
            ))}
          </div>
          <div className="w-6 sm:w-10"></div>
          <div className="flex gap-1">
            {['D', 'E', 'F'].map(col => (
              <span key={col} className="w-10 sm:w-12 text-center text-xs text-slate-500 font-medium">{col}</span>
            ))}
          </div>
        </div>

        {/* Primera Clase */}
        {primeraClaseRows.length > 0 && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="px-4 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-200 text-xs font-medium">
                ✨ Primera Clase
              </span>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
              {primeraClaseRows.map(renderSeatRow)}
            </div>
          </div>
        )}

        {/* Separador */}
        {primeraClaseRows.length > 0 && economicaRows.length > 0 && (
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-xs text-slate-400">Salida de emergencia</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>
        )}

        {/* Clase Económica */}
        {economicaRows.length > 0 && (
          <div>
            <div className="text-center mb-3">
              <span className="px-4 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-cyan-200 text-xs font-medium">
                🌿 Clase Económica
              </span>
            </div>
            <div className="bg-cyan-500/5 rounded-xl p-3 border border-cyan-500/20 max-h-96 overflow-y-auto">
              {economicaRows.map(renderSeatRow)}
            </div>
          </div>
        )}

        {/* Parte trasera del avión */}
        <div className="flex justify-center mt-4">
          <div className="px-6 py-2 bg-slate-800 rounded-b-3xl border-b-2 border-x-2 border-cyan-500/30">
            <span className="text-xs text-cyan-300 font-medium">COLA</span>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
        <p className="text-xs text-slate-400">
          Total de asientos: {totalSeats} | 
          Primera clase: {primeraCount} | 
          Económica: {economicaCount}
        </p>
      </div>
    </div>
  );
};

export default CheckinSeatMap;
