import React, { useState } from 'react';
import { Clock } from 'lucide-react';

// Componente de Input de Hora Moderno
const TimeInput = ({ label, value, onChange, placeholder = "HH:MM" }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTimeChange = (e) => {
    const input = e.target.value;
    
    // Permitir solo números y dos puntos
    const cleaned = input.replace(/[^\d:]/g, '');
    
    // Limitar a formato HH:MM (5 caracteres máximo)
    if (cleaned.length <= 5) {
      // Auto-insertar los dos puntos después de 2 dígitos
      if (cleaned.length === 2 && !cleaned.includes(':') && input.length > value.length) {
        onChange(cleaned + ':');
      } else {
        onChange(cleaned);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Validar y formatear al perder el foco
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        let hours = parseInt(parts[0], 10);
        let minutes = parseInt(parts[1], 10);
        
        // Validar rangos
        if (isNaN(hours)) hours = 0;
        if (isNaN(minutes)) minutes = 0;
        hours = Math.min(Math.max(hours, 0), 23);
        minutes = Math.min(Math.max(minutes, 0), 59);
        
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onChange(formatted);
      } else if (parts.length === 1 && parts[0].length > 0) {
        // Si solo hay horas, agregar :00
        let hours = parseInt(parts[0], 10);
        if (isNaN(hours)) hours = 0;
        hours = Math.min(Math.max(hours, 0), 23);
        onChange(`${hours.toString().padStart(2, '0')}:00`);
      }
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
  mostrarHorarios: boolean;
  setMostrarHorarios: (value: boolean) => void;
  horaIdaInicio: string;
  horaIdaFin: string;
  setHoraIdaInicio: (value: string) => void;
  setHoraIdaFin: (value: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  mostrarHorarios,
  setMostrarHorarios,
  horaIdaInicio,
  horaIdaFin,
  setHoraIdaInicio,
  setHoraIdaFin,
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
    if (horaIdaInicio || horaIdaFin) {
      const inicio = horaIdaInicio || "00:00";
      const fin = horaIdaFin || "23:59";
      return `Horarios: ${inicio} - ${fin}`;
    }
    
    return "Seleccionar horarios";
  };

  const limpiarHorarios = () => {
    setHoraIdaInicio("");
    setHoraIdaFin("");
  };

  const hayHorariosSeleccionados = horaIdaInicio || horaIdaFin;

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
              <div className="text-sm font-semibold text-gray-900">Horario en hora colombiana</div>
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