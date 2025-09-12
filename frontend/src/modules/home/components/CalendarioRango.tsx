import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Estilos principales
import "react-date-range/dist/theme/default.css"; // Tema por defecto
import { es } from 'date-fns/locale'; // Importar localización en español

// Componente SVG para el ícono del calendario
const IconoCalendario = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
  </svg>
);

// Tipos para las propiedades del componente
type CalendarioRangoProps = {
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  modo?: "ida_vuelta" | "solo_ida";
};

export default function CalendarioRango({ onChange, modo = "ida_vuelta" }: CalendarioRangoProps) {
  const hoy = new Date();
  
  // Estado para el rango de fechas seleccionado
  const [range, setRange] = useState([
    { startDate: hoy, endDate: null, key: "selection" },
  ]);

  // Estado para controlar la visibilidad del calendario
  const [open, setOpen] = useState(false);
  // Estado para saber qué campo está activo (salida o regreso)
  const [activeField, setActiveField] = useState<'departure' | 'return'>('departure');
  
  // Ref para detectar clics fuera del componente
  const ref = useRef<HTMLDivElement>(null);

  // Efecto para limpiar la fecha de regreso si se cambia a modo "solo_ida"
  useEffect(() => {
    if (modo === "solo_ida" && range[0].endDate) {
      const newRange = [{ startDate: range[0].startDate, endDate: null, key: "selection" }];
      setRange(newRange);
      setActiveField('departure');
    }
  }, [modo]);

  // Efecto para cerrar el calendario al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejador del cambio de fechas en el calendario
  const handleChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    
    if (modo === "solo_ida") {
      const newRange = [{ startDate, endDate: null, key: "selection" }];
      setRange(newRange);
      onChange({ startDate, endDate: null });
      
      // Cierra el calendario automáticamente al seleccionar una fecha
      if (startDate) {
        setTimeout(() => setOpen(false), 200);
      }
    } else { // Modo ida y vuelta
      setRange([ranges.selection]);
      onChange({ startDate, endDate });
      
      // Si se elige la salida y no hay regreso, activa el campo de regreso
      if (startDate && !endDate && activeField === 'departure') {
        setActiveField('return');
      }
      
      // Si ya se eligieron ambas fechas, cierra el calendario
      if (startDate && endDate) {
        setTimeout(() => setOpen(false), 200);
      }
    }
  };

  // Formatea la fecha a "dd/mm/yyyy"
  const formatFecha = (fecha: Date | null) => {
    if (!fecha) return "";
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  // Formatea la fecha a "dd mes"
  const formatFechaCorta = (fecha: Date | null) => {
    if (!fecha) return "";
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short"
    });
  };

  // Manejador del clic en los campos de fecha para abrir el calendario
  const handleFieldClick = (field: 'departure' | 'return') => {
    if (modo === "solo_ida" && field === 'return') return; // No hacer nada si es solo ida y se clica en regreso
    
    setActiveField(field);
    setOpen(true);
  };

  // Lógica para el diseño responsivo
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const mostrarReturn = modo === "ida_vuelta";

  return (
    <div className="relative w-full" ref={ref}>
      {/* Layout móvil: campos apilados */}
      <div className="md:hidden">
        <div className="space-y-2">
          <div 
            className={`w-full p-3 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
              activeField === 'departure' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleFieldClick('departure')}
          >
            <div className="flex items-center gap-2">
              <IconoCalendario />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  {modo === "solo_ida" ? "Fecha de vuelo" : "Departure"}
                </p>
                <p className="font-semibold text-gray-800 text-sm">
                  {formatFechaCorta(range[0].startDate) || "17 sept"}
                </p>
              </div>
            </div>
          </div>
          
          {mostrarReturn && (
            <div 
              className={`w-full p-3 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                activeField === 'return' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleFieldClick('return')}
            >
              <div className="flex items-center gap-2">
                <IconoCalendario />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Return</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {formatFechaCorta(range[0].endDate) || "¿Cuándo?"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layout tablet y desktop: campos horizontales */}
      <div className="hidden md:flex w-full border border-gray-300 rounded-xl cursor-pointer overflow-hidden">
        <div 
          className={`${mostrarReturn ? "flex-1" : "w-full"} p-2 lg:p-3 ${
            mostrarReturn ? "border-r border-gray-300" : ""
          } transition-colors ${
            activeField === 'departure' ? 'border-b-2 border-blue-600' : 'border-b-2 border-transparent hover:bg-gray-50'
          }`}
          onClick={() => handleFieldClick('departure')}
        >
          <div className="flex items-center gap-2">
            <IconoCalendario />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-1">
                {modo === "solo_ida" ? "Fecha de vuelo" : "Departure"}
              </p>
              <p className="font-semibold text-gray-800 text-sm lg:text-base truncate">
                {isTablet ? formatFechaCorta(range[0].startDate) : formatFecha(range[0].startDate)}
              </p>
            </div>
          </div>
        </div>
        
        {mostrarReturn && (
          <div 
            className={`flex-1 p-2 lg:p-3 transition-colors ${
              activeField === 'return' ? 'border-b-2 border-blue-600' : 'border-b-2 border-transparent hover:bg-gray-50'
            }`}
            onClick={() => handleFieldClick('return')}
          >
            <div className="flex items-center gap-2">
              <IconoCalendario />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 mb-1">Return</p>
                <p className="font-semibold text-gray-800 text-sm lg:text-base truncate">
                  {isTablet ? 
                    (formatFechaCorta(range[0].endDate) || "¿Cuándo?") : 
                    (formatFecha(range[0].endDate) || "When are you returning?")
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendario desplegable */}
      {open && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border left-0 right-0 md:left-0 md:right-auto">
          <div className="p-3 md:p-4">
            <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 text-center text-sm md:text-base">
              {modo === "solo_ida" 
                ? "¿Cuándo viajas?" 
                : activeField === 'departure' 
                  ? '¿Cuándo viajas?' 
                  : '¿Cuándo regresas?'
              }
            </h3>
            <div className="overflow-hidden">
              <DateRange
                locale={es}
                editableDateInputs={false}
                moveRangeOnFirstSelection={modo === "solo_ida"}
                ranges={range}
                onChange={handleChange}
                minDate={hoy}
                months={2} // MODIFICACIÓN 1: Siempre mostrar 2 meses
                direction={isMobile ? "vertical" : "horizontal"}
                rangeColors={["#1d4ed8"]}
                showDateDisplay={false}
                showMonthAndYearPickers={true}
                fixedHeight={true}
                className="responsive-calendar"
              />
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados para el calendario responsivo */}
      <style>{`
        .responsive-calendar .rdrCalendarWrapper {
          font-size: ${isMobile ? '14px' : '16px'};
        }
        
        .responsive-calendar .rdrMonth {
          width: ${isMobile ? '100%' : 'auto'};
        }
        
        .responsive-calendar .rdrDay {
          height: ${isMobile ? '32px' : '40px'};
          line-height: ${isMobile ? '32px' : '40px'};
        }
        
        @media (max-width: 768px) {
          .responsive-calendar .rdrDateRangeWrapper {
            width: 100% !important;
          }
          
          .responsive-calendar .rdrCalendarWrapper {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}