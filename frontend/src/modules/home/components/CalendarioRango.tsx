import { useState, useRef, useEffect } from "react";
// CAMBIO 1: Importamos también el componente 'Calendar'
import { DateRange, Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { es } from 'date-fns/locale';

const CalendarioRango = ({ 
  onChange, 
  modo = "ida_vuelta", 
  isOpen = false, 
  onOpenChange,
  fechaInicial = null,
  fechaFinal = null
}) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  
  const [range, setRange] = useState([
    {
      startDate: hoy,
      endDate: modo === "ida_vuelta" ? mañana : null,
      key: "selection"
    },
  ]);

  const ref = useRef(null);

  useEffect(() => {
    const start = fechaInicial ? new Date(`${fechaInicial}T00:00:00`) : hoy;
    const end = modo === "ida_vuelta"
      ? (fechaFinal ? new Date(`${fechaFinal}T00:00:00`) : mañana)
      : null;

    setRange([{
      startDate: start,
      endDate: end,
      key: "selection"
    }]);
  }, [fechaInicial, fechaFinal, modo]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  // CAMBIO 2: La función ahora maneja los dos formatos de fecha
  const handleChange = (item) => {
    if (modo === "solo_ida") {
      // Para <Calendar>, 'item' es la fecha directamente
      const startDate = item;
      onChange({ startDate, endDate: null });
      if (startDate) {
        setTimeout(() => onOpenChange(false), 300);
      }
    } else {
      // Para <DateRange>, 'item' es un objeto { selection: { ... } }
      const { startDate, endDate } = item.selection;
      onChange({ startDate, endDate });
      if (startDate && endDate) {
        if (endDate.getTime() > startDate.getTime()) {
           setTimeout(() => onOpenChange(false), 300);
        }
      }
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-auto">
          <style>{/* Tus estilos personalizados */}</style>
          
          {/* CAMBIO 3: La lógica condicional ahora funcionará correctamente */}
          {modo === "solo_ida" ? (
            <Calendar
              locale={es}
              date={range[0].startDate}
              onChange={handleChange}
              minDate={hoy}
              color="#0e254d"
              className="custom-date-range"
            />
          ) : (
            <DateRange
              locale={es}
              editableDateInputs={true}
              moveRangeOnFirstSelection={false}
              ranges={range}
              onChange={handleChange}
              months={2} // Mejora: Mostrar 2 meses para rangos es más cómodo
              direction="horizontal"
              rangeColors={["#0e254d"]}
              minDate={hoy}
              showDateDisplay={false}
              showMonthAndYearPickers={true}
              fixedHeight={true}
              className="custom-date-range"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarioRango;