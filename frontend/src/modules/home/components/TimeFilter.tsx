import React, { useState } from 'react';
import { Clock } from 'lucide-react';

// Componente de Input de Hora Moderno
const TimeInput = ({ label, value, onChange, placeholder = "HH:MM" }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTimeChange = (e) => {
    let input = e.target.value.replace(/[^\d]/g, '');
    
    if (input.length >= 2) {
      const hours = input.slice(0, 2);
      const minutes = input.slice(2, 4);
      
      // Validar horas (00-23)
      const validHours = Math.min(parseInt(hours) || 0, 23).toString().padStart(2, '0');
      
      if (input.length > 2) {
        // Validar minutos (00-59)
        const validMinutes = Math.min(parseInt(minutes) || 0, 59).toString().padStart(2, '0');
        input = `${validHours}:${validMinutes}`;
      } else {
        input = validHours;
      }
    }
    
    onChange(input);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Autocompletar formato si está incompleto
    if (value && value.length === 2) {
      onChange(`${value}:00`);
    }
  };

  return (
    <div className="flex-1">
      <div className="text-xs text-gray-500 mb-1.5 font-medium">{label}</div>
      <div className={`relative bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 transition-all duration-200 ${
        isFocused ? 'border-[#0e254d] shadow-md shadow-blue-100' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Clock className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#0e254d]' : 'text-gray-400'}`} />
          <input
            type="text"
            value={value}
            onChange={handleTimeChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={5}
            className="w-full bg-transparent outline-none text-sm font-mono font-medium text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

// Componente TimeFilter para usar en filterSearchBar
interface TimeFilterProps {
  modo: "ida_vuelta" | "solo_ida";
  mostrarHorarios: boolean;
  setMostrarHorarios: (value: boolean) => void;
  horaIdaInicio: string;
  horaIdaFin: string;
  horaVueltaInicio: string;
  horaVueltaFin: string;
  setHoraIdaInicio: (value: string) => void;
  setHoraIdaFin: (value: string) => void;
  setHoraVueltaInicio: (value: string) => void;
  setHoraVueltaFin: (value: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  modo,
  mostrarHorarios,
  setMostrarHorarios,
  horaIdaInicio,
  horaIdaFin,
  horaVueltaInicio,
  horaVueltaFin,
  setHoraIdaInicio,
  setHoraIdaFin,
  setHoraVueltaInicio,
  setHoraVueltaFin,
}) => {
  const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m19 9-7 7-7-7"
      />
    </svg>
  );

  const getResumenHorario = () => {
    const partes = [];
    
    if (horaIdaInicio || horaIdaFin) {
      const inicio = horaIdaInicio || "00:00";
      const fin = horaIdaFin || "23:59";
      partes.push(`Ida: ${inicio} - ${fin}`);
    }
    
    if (modo === "ida_vuelta" && (horaVueltaInicio || horaVueltaFin)) {
      const inicio = horaVueltaInicio || "00:00";
      const fin = horaVueltaFin || "23:59";
      partes.push(`Vuelta: ${inicio} - ${fin}`);
    }
    
    return partes.length > 0 ? partes.join(" • ") : "Seleccionar horarios";
  };

  const limpiarHorarios = () => {
    setHoraIdaInicio("");
    setHoraIdaFin("");
    setHoraVueltaInicio("");
    setHoraVueltaFin("");
  };

  const hayHorariosSeleccionados = horaIdaInicio || horaIdaFin || horaVueltaInicio || horaVueltaFin;

  return (
    <div className="flex flex-col relative">
      <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
        Horario preferido
      </label>
      
      <div
        onClick={() => setMostrarHorarios(!mostrarHorarios)}
        className="flex items-center justify-between border border-gray-300 bg-white rounded-xl p-3 cursor-pointer shadow-sm h-[58px] hover:border-gray-400 transition-colors"
      >
        <span className={`text-base font-sans ${hayHorariosSeleccionados ? 'text-gray-900' : 'text-gray-500'}`}>
          {getResumenHorario()}
        </span>
        <ChevronDownIcon className={mostrarHorarios ? "rotate-180" : ""} />
      </div>

      {mostrarHorarios && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-full">
          {/* Horarios de Ida */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900">Vuelo de Ida</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Rango de tiempo
              </div>
            </div>
            
            <div className="flex gap-2">
              <TimeInput
                label="Desde"
                value={horaIdaInicio}
                onChange={setHoraIdaInicio}
                placeholder="06:00"
              />
              <div className="flex items-end pb-3 text-gray-400 font-bold">→</div>
              <TimeInput
                label="Hasta"
                value={horaIdaFin}
                onChange={setHoraIdaFin}
                placeholder="22:00"
              />
            </div>
          </div>

          {/* Horarios de Vuelta */}
          {modo === "ida_vuelta" && (
            <div className="pt-4 border-t border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-gray-900">Vuelo de Vuelta</div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Rango de tiempo
                </div>
              </div>
              
              <div className="flex gap-2">
                <TimeInput
                  label="Desde"
                  value={horaVueltaInicio}
                  onChange={setHoraVueltaInicio}
                  placeholder="06:00"
                />
                <div className="flex items-end pb-3 text-gray-400 font-bold">→</div>
                <TimeInput
                  label="Hasta"
                  value={horaVueltaFin}
                  onChange={setHoraVueltaFin}
                  placeholder="22:00"
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={limpiarHorarios}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-sans hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setMostrarHorarios(false)}
              className="flex-1 py-2 bg-[#0e254d] text-white rounded-lg text-sm font-sans hover:bg-[#0a1a3a] transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

