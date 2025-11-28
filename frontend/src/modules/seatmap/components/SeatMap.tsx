import { useState, useMemo } from 'react';

// Tipos de asiento
export type SeatStatus = 'available' | 'occupied' | 'selected' | 'blocked' | 'exit-row';

export interface Seat {
  id: string;
  row: number;
  column: string;
  status: SeatStatus;
  clase: 'primera' | 'economica';
  price?: number;
}

export interface SeatMapConfig {
  tipo: 'nacional' | 'internacional';
  occupiedSeats?: string[]; // IDs de asientos ocupados
  selectedSeat?: string | null; // Asiento seleccionado actualmente
  passengerClass?: 'primera' | 'economica'; // Clase del pasajero (solo puede seleccionar de su clase)
}

interface SeatMapProps {
  config: SeatMapConfig;
  onSeatSelect?: (seat: Seat) => void;
  readOnly?: boolean;
}

// Configuración de filas de salida de emergencia
const EXIT_ROWS_NACIONAL = [10, 11];
const EXIT_ROWS_INTERNACIONAL = [15, 16, 30, 31];

const SeatMap: React.FC<SeatMapProps> = ({ config, onSeatSelect, readOnly = false }) => {
  const { tipo, occupiedSeats = [], selectedSeat, passengerClass } = config;
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Configuración según tipo de vuelo
  const flightConfig = useMemo(() => {
    if (tipo === 'nacional') {
      return {
        totalSeats: 150,
        firstClassEnd: 25,
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 6,
        totalRows: 25,
        exitRows: EXIT_ROWS_NACIONAL,
        aisleAfter: ['C'], // Pasillo después de columna C
      };
    } else {
      return {
        totalSeats: 250,
        firstClassEnd: 50,
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        seatsPerRow: 6,
        totalRows: 42, // 250/6 ≈ 42 filas
        exitRows: EXIT_ROWS_INTERNACIONAL,
        aisleAfter: ['C'],
      };
    }
  }, [tipo]);

  // Generar asientos
  const seats = useMemo(() => {
    const seatList: Seat[] = [];
    let seatNumber = 1;

    for (let row = 1; row <= flightConfig.totalRows; row++) {
      for (const column of flightConfig.columns) {
        if (seatNumber > flightConfig.totalSeats) break;

        const seatId = `${row}${column}`;
        const isFirstClass = seatNumber <= flightConfig.firstClassEnd;
        const isOccupied = occupiedSeats.includes(seatId);
        const isSelected = selectedSeat === seatId;
        const isExitRow = flightConfig.exitRows.includes(row);

        // Determinar si el asiento está bloqueado (diferente clase)
        const isBlocked = passengerClass && 
          ((passengerClass === 'primera' && !isFirstClass) || 
           (passengerClass === 'economica' && isFirstClass));

        let status: SeatStatus = 'available';
        if (isSelected) status = 'selected';
        else if (isOccupied) status = 'occupied';
        else if (isBlocked) status = 'blocked';
        else if (isExitRow) status = 'exit-row';

        seatList.push({
          id: seatId,
          row,
          column,
          status,
          clase: isFirstClass ? 'primera' : 'economica',
        });

        seatNumber++;
      }
    }

    return seatList;
  }, [flightConfig, occupiedSeats, selectedSeat, passengerClass]);

  // Agrupar asientos por fila
  const seatsByRow = useMemo(() => {
    const grouped: Record<number, Seat[]> = {};
    seats.forEach(seat => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);

  // Manejar click en asiento
  const handleSeatClick = (seat: Seat) => {
    if (readOnly) return;
    if (seat.status === 'occupied' || seat.status === 'blocked') return;
    onSeatSelect?.(seat);
  };

  // Obtener estilos del asiento
  const getSeatStyles = (seat: Seat) => {
    const baseStyles = "w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer transform hover:scale-110";
    
    switch (seat.status) {
      case 'selected':
        return `${baseStyles} bg-gradient-to-br from-[#39A5D8] to-[#1180B8] text-white shadow-lg shadow-[#39A5D8]/50 ring-2 ring-white`;
      case 'occupied':
        return `${baseStyles} bg-gradient-to-br from-red-400 to-red-600 text-white cursor-not-allowed opacity-80`;
      case 'blocked':
        return `${baseStyles} bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed opacity-60`;
      case 'exit-row':
        return `${baseStyles} bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-400/40`;
      default:
        if (seat.clase === 'primera') {
          return `${baseStyles} bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-400/40`;
        }
        return `${baseStyles} bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-400/40`;
    }
  };

  // Obtener la primera fila de primera clase y económica
  const firstClassRows = Object.keys(seatsByRow)
    .map(Number)
    .filter(row => seatsByRow[row][0]?.clase === 'primera');
  const economyRows = Object.keys(seatsByRow)
    .map(Number)
    .filter(row => seatsByRow[row][0]?.clase === 'economica');

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Selecciona tu Asiento
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Vuelo {tipo === 'nacional' ? 'Nacional' : 'Internacional'} • {flightConfig.totalSeats} asientos
        </p>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-purple-600"></div>
          <span className="text-white text-xs md:text-sm">Primera Clase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
          <span className="text-white text-xs md:text-sm">Económica</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-500"></div>
          <span className="text-white text-xs md:text-sm">Salida de emergencia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-400 to-red-600"></div>
          <span className="text-white text-xs md:text-sm">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#39A5D8] to-[#1180B8] ring-2 ring-white"></div>
          <span className="text-white text-xs md:text-sm">Tu selección</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-300 to-gray-400 opacity-60"></div>
          <span className="text-white text-xs md:text-sm">No disponible</span>
        </div>
      </div>

      {/* Avión Container */}
      <div className="relative max-w-lg mx-auto">
        {/* Nariz del avión */}
        <div className="relative mx-auto mb-4">
          <div className="w-32 h-20 mx-auto bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-full border-4 border-slate-500 flex items-center justify-center">
            <div className="w-16 h-8 bg-gradient-to-b from-sky-400 to-sky-600 rounded-t-full opacity-80"></div>
          </div>
          <div className="text-center text-slate-400 text-xs mt-2 font-semibold tracking-wider">
            CABINA
          </div>
        </div>

        {/* Cuerpo del avión */}
        <div className="relative bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700 rounded-lg border-4 border-slate-500 p-4 md:p-6">
          
          {/* Indicadores de columnas */}
          <div className="flex justify-center gap-1 mb-4">
            <div className="flex gap-1 mr-6">
              {['A', 'B', 'C'].map(col => (
                <div key={col} className="w-9 h-6 md:w-10 flex items-center justify-center text-slate-300 font-bold text-sm">
                  {col}
                </div>
              ))}
            </div>
            <div className="flex gap-1 ml-6">
              {['D', 'E', 'F'].map(col => (
                <div key={col} className="w-9 h-6 md:w-10 flex items-center justify-center text-slate-300 font-bold text-sm">
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* Primera Clase */}
          {firstClassRows.length > 0 && (
            <>
              <div className="text-center mb-3">
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-semibold tracking-wider">
                  ✨ PRIMERA CLASE
                </span>
              </div>
              <div className="space-y-2 mb-6">
                {firstClassRows.map(rowNum => (
                  <div key={rowNum} className="flex items-center justify-center gap-1">
                    {/* Número de fila izquierda */}
                    <div className="w-6 text-right text-slate-400 text-xs font-mono mr-2">
                      {rowNum}
                    </div>
                    
                    {/* Asientos lado izquierdo (A, B, C) */}
                    <div className="flex gap-1">
                      {seatsByRow[rowNum]?.filter(s => ['A', 'B', 'C'].includes(s.column)).map(seat => (
                        <button
                          key={seat.id}
                          className={getSeatStyles(seat)}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={readOnly || seat.status === 'occupied' || seat.status === 'blocked'}
                          title={`Asiento ${seat.id} - ${seat.clase === 'primera' ? 'Primera Clase' : 'Económica'}${seat.status === 'occupied' ? ' (Ocupado)' : ''}`}
                        >
                          {seat.column}
                        </button>
                      ))}
                    </div>

                    {/* Pasillo */}
                    <div className="w-8 md:w-12 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-slate-500/30"></div>
                    </div>

                    {/* Asientos lado derecho (D, E, F) */}
                    <div className="flex gap-1">
                      {seatsByRow[rowNum]?.filter(s => ['D', 'E', 'F'].includes(s.column)).map(seat => (
                        <button
                          key={seat.id}
                          className={getSeatStyles(seat)}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={readOnly || seat.status === 'occupied' || seat.status === 'blocked'}
                          title={`Asiento ${seat.id} - ${seat.clase === 'primera' ? 'Primera Clase' : 'Económica'}${seat.status === 'occupied' ? ' (Ocupado)' : ''}`}
                        >
                          {seat.column}
                        </button>
                      ))}
                    </div>

                    {/* Número de fila derecha */}
                    <div className="w-6 text-left text-slate-400 text-xs font-mono ml-2">
                      {rowNum}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Separador de clases */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            <span className="text-emerald-400 text-xs font-semibold tracking-wider">CLASE ECONÓMICA</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          </div>

          {/* Clase Económica */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {economyRows.map(rowNum => {
              const isExitRow = flightConfig.exitRows.includes(rowNum);
              return (
                <div key={rowNum}>
                  {/* Indicador de salida de emergencia */}
                  {isExitRow && flightConfig.exitRows[0] === rowNum && (
                    <div className="flex items-center justify-center gap-2 my-3">
                      <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-amber-400 text-xs font-semibold tracking-wider">
                        🚪 SALIDA DE EMERGENCIA - ESPACIO EXTRA
                      </span>
                      <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-1">
                    {/* Número de fila izquierda */}
                    <div className="w-6 text-right text-slate-400 text-xs font-mono mr-2">
                      {rowNum}
                    </div>
                    
                    {/* Asientos lado izquierdo (A, B, C) */}
                    <div className="flex gap-1">
                      {seatsByRow[rowNum]?.filter(s => ['A', 'B', 'C'].includes(s.column)).map(seat => (
                        <button
                          key={seat.id}
                          className={getSeatStyles(seat)}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={readOnly || seat.status === 'occupied' || seat.status === 'blocked'}
                          title={`Asiento ${seat.id} - ${seat.clase === 'primera' ? 'Primera Clase' : 'Económica'}${seat.status === 'occupied' ? ' (Ocupado)' : ''}${flightConfig.exitRows.includes(rowNum) ? ' (Salida de emergencia)' : ''}`}
                        >
                          {seat.column}
                        </button>
                      ))}
                    </div>

                    {/* Pasillo */}
                    <div className="w-8 md:w-12 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-slate-500/30"></div>
                    </div>

                    {/* Asientos lado derecho (D, E, F) */}
                    <div className="flex gap-1">
                      {seatsByRow[rowNum]?.filter(s => ['D', 'E', 'F'].includes(s.column)).map(seat => (
                        <button
                          key={seat.id}
                          className={getSeatStyles(seat)}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          disabled={readOnly || seat.status === 'occupied' || seat.status === 'blocked'}
                          title={`Asiento ${seat.id} - ${seat.clase === 'primera' ? 'Primera Clase' : 'Económica'}${seat.status === 'occupied' ? ' (Ocupado)' : ''}${flightConfig.exitRows.includes(rowNum) ? ' (Salida de emergencia)' : ''}`}
                        >
                          {seat.column}
                        </button>
                      ))}
                    </div>

                    {/* Número de fila derecha */}
                    <div className="w-6 text-left text-slate-400 text-xs font-mono ml-2">
                      {rowNum}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cola del avión */}
        <div className="relative mx-auto mt-4">
          <div className="w-24 h-16 mx-auto bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-3xl border-4 border-t-0 border-slate-500"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-40 h-12 bg-gradient-to-t from-slate-600 to-slate-700 rounded-b-full border-4 border-t-0 border-slate-500 -z-10"></div>
        </div>

        {/* Alas */}
        <div className="absolute top-1/3 -left-8 md:-left-12 w-12 md:w-16 h-40 bg-gradient-to-l from-slate-600 to-slate-700 rounded-l-full border-4 border-r-0 border-slate-500 transform -skew-y-6"></div>
        <div className="absolute top-1/3 -right-8 md:-right-12 w-12 md:w-16 h-40 bg-gradient-to-r from-slate-600 to-slate-700 rounded-r-full border-4 border-l-0 border-slate-500 transform skew-y-6"></div>
      </div>

      {/* Tooltip del asiento hover */}
      {hoveredSeat && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl text-sm font-medium z-50 animate-fade-in">
          Asiento <span className="font-bold text-[#1180B8]">{hoveredSeat}</span>
          {seats.find(s => s.id === hoveredSeat)?.clase === 'primera' && (
            <span className="ml-2 text-purple-600">• Primera Clase</span>
          )}
          {seats.find(s => s.id === hoveredSeat)?.clase === 'economica' && (
            <span className="ml-2 text-emerald-600">• Económica</span>
          )}
        </div>
      )}

      {/* Estilos adicionales */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SeatMap;
