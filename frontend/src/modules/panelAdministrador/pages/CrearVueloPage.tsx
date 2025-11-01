import React, { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useCrearVuelo } from "../hooks/useCrearVuelo";
import { useAeropuertoValidation, type Aeropuerto } from "../hooks/useAeropuertoValidation";

// ================== ICONOS MODERNOS ==================
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlaneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-white rounded-2xl shadow-2xl border-l-4 p-5 transform transition-all duration-300 ease-out
            ${toast.type === 'success' ? 'border-emerald-500' : ''}
            ${toast.type === 'error' ? 'border-rose-500' : ''}
            ${toast.type === 'warning' ? 'border-amber-500' : ''}
            backdrop-blur-sm bg-white/95
          `}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <SuccessIcon />}
              {toast.type === 'error' && <ErrorIcon />}
              {toast.type === 'warning' && <WarningIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{toast.title}</p>
              <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
            </div>
            <button
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => removeToast(toast.id)}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CrearVueloPage: React.FC = () => {
  const [errores, setErrores] = React.useState<{ [key: string]: string }>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const showErrorToast = useCallback((title: string, message: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const showSuccessToast = useCallback((title: string, message: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const showWarningToast = useCallback((title: string, message: string) => {
    addToast('warning', title, message);
  }, [addToast]);

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-time-format', '24h');
    const style = document.createElement('style');
    style.textContent = `
      input[type="time"] {
        color-scheme: light !important;
        -webkit-appearance: textfield !important;
      }
      input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(0.6) sepia(1) saturate(5) hue-rotate(175deg) brightness(1.2) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      document.documentElement.removeAttribute('data-time-format');
    };
  }, []);
  
  const {
    aeronaves,
    form,
    setForm,
    salidaDate,
    setSalidaDate,
    llegadaDate,
    setLlegadaDate,
    error,
    loading,
    handleTarifaChange,
    handleChange,
    handleSubmit,
  } = useCrearVuelo();

  const {
    aeropuertoOrigenSeleccionado,
    aeropuertoDestinoSeleccionado,
    sugerenciasOrigen,
    sugerenciasDestino,
    filtrarAeropuertosOrigen,
    filtrarAeropuertosDestino,
    seleccionarAeropuertoOrigen,
    seleccionarAeropuertoDestino,
    resetearOrigen,
    resetearDestino,
    validarAeropuertos,
    error: errorAeropuertos,
  } = useAeropuertoValidation();

  const [textoOrigen, setTextoOrigen] = React.useState("");
  const [textoDestino, setTextoDestino] = React.useState("");
  const [escribiendoOrigen, setEscribiendoOrigen] = React.useState(false);
  const [escribiendoDestino, setEscribiendoDestino] = React.useState(false);

  const validarCampos = () => {
    const nuevosErrores: { [key: string]: string } = {};
    
    if (!validarAeropuertos()) {
      if (errorAeropuertos) {
        nuevosErrores.aeropuertos = errorAeropuertos;
        showErrorToast('Error de validación', errorAeropuertos);
      }
    }
    
    if (!form.titulo || form.titulo.trim() === "") {
      nuevosErrores.titulo = "El título es obligatorio";
      showErrorToast('Campo obligatorio', 'El título es obligatorio');
    }
    if (!form.descripcion_corta || form.descripcion_corta.trim() === "") {
      nuevosErrores.descripcion_corta = "La descripción corta es obligatoria";
      showErrorToast('Campo obligatorio', 'La descripción corta es obligatoria');
    }
    if (!form.descripcion_larga || form.descripcion_larga.trim() === "") {
      nuevosErrores.descripcion_larga = "La descripción larga es obligatoria";
      showErrorToast('Campo obligatorio', 'La descripción larga es obligatoria');
    }
    if (!form.url_imagen || form.url_imagen.trim() === "") {
      nuevosErrores.url_imagen = "La URL de la imagen es obligatoria";
      showErrorToast('Campo obligatorio', 'La URL de la imagen es obligatoria');
    }
    if (!form.id_aeronaveFK) {
      nuevosErrores.id_aeronaveFK = "Selecciona una aeronave";
      showErrorToast('Campo obligatorio', 'Debe seleccionar una aeronave');
    }
    
    if (!aeropuertoOrigenSeleccionado) {
      nuevosErrores.id_aeropuerto_origenFK = "Selecciona el aeropuerto de origen";
      showErrorToast('Campo obligatorio', 'Debe seleccionar el aeropuerto de origen');
    }
    if (!aeropuertoDestinoSeleccionado) {
      nuevosErrores.id_aeropuerto_destinoFK = "Selecciona el aeropuerto de destino";
      showErrorToast('Campo obligatorio', 'Debe seleccionar el aeropuerto de destino');
    }
    
    if (!salidaDate) {
      nuevosErrores.salida = "Selecciona la fecha de salida";
      showErrorToast('Campo obligatorio', 'Debe seleccionar la fecha de salida');
    }
    if (!llegadaDate) {
      nuevosErrores.llegada = "Selecciona la fecha de llegada";
      showErrorToast('Campo obligatorio', 'Debe seleccionar la fecha de llegada');
    }
    if (!form.tarifa[0].precio_base || Number(form.tarifa[0].precio_base) <= 0) {
      nuevosErrores.tarifa_economica = "La tarifa económica debe ser mayor a 0";
      showErrorToast('Error de validación', 'La tarifa económica debe ser mayor a 0');
    }
    if (!form.tarifa[1].precio_base || Number(form.tarifa[1].precio_base) <= 0) {
      nuevosErrores.tarifa_premium = "La tarifa premium debe ser mayor a 0";
      showErrorToast('Error de validación', 'La tarifa premium debe ser mayor a 0');
    }
    if (form.promocion) {
      if (!form.promo_nombre || form.promo_nombre.trim() === "") {
        nuevosErrores.promo_nombre = "El nombre de la promoción es obligatorio";
        showErrorToast('Campo obligatorio', 'El nombre de la promoción es obligatorio');
      }
      if (!form.promo_descripcion || form.promo_descripcion.trim() === "") {
        nuevosErrores.promo_descripcion = "La descripción de la promoción es obligatoria";
        showErrorToast('Campo obligatorio', 'La descripción de la promoción es obligatoria');
      }
      if (!form.descuento || Number(form.descuento) <= 0) {
        nuevosErrores.descuento = "El descuento debe ser mayor a 0";
        showErrorToast('Error de validación', 'El descuento debe ser mayor a 0');
      }
      if (!form.promocion_inicio) {
        nuevosErrores.promocion_inicio = "La fecha de inicio es obligatoria";
        showErrorToast('Campo obligatorio', 'La fecha de inicio de la promoción es obligatoria');
      }
      if (!form.promocion_fin) {
        nuevosErrores.promocion_fin = "La fecha de fin es obligatoria";
        showErrorToast('Campo obligatorio', 'La fecha de fin de la promoción es obligatoria');
      }

      if (form.promocion_fin && salidaDate) {
      const finPromo = new Date(form.promocion_fin);
      if (finPromo > salidaDate) {
        nuevosErrores.promocion_fin = "La fecha de fin de la promoción no puede ser posterior a la salida del vuelo";
        showErrorToast('Error de validación', 'La fecha de fin de la promoción no puede ser posterior a la salida del vuelo');
      }
    }
  }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  React.useEffect(() => {
    if (aeropuertoOrigenSeleccionado) {
      setForm((f: typeof form) => ({ ...f, id_aeropuerto_origenFK: aeropuertoOrigenSeleccionado.id_aeropuerto }));
      if (!escribiendoOrigen) {
        setTextoOrigen(`${aeropuertoOrigenSeleccionado.nombre} (${aeropuertoOrigenSeleccionado.codigo_iata})`);
      }
    }
  }, [aeropuertoOrigenSeleccionado, setForm, escribiendoOrigen]);

  React.useEffect(() => {
    if (aeropuertoDestinoSeleccionado) {
      setForm((f: typeof form) => ({ ...f, id_aeropuerto_destinoFK: aeropuertoDestinoSeleccionado.id_aeropuerto }));
      if (!escribiendoDestino) {
        setTextoDestino(`${aeropuertoDestinoSeleccionado.nombre} (${aeropuertoDestinoSeleccionado.codigo_iata})`);
      }
    }
  }, [aeropuertoDestinoSeleccionado, setForm, escribiendoDestino]);

  const handleOrigenChange = (valor: string) => {
    setTextoOrigen(valor);
    setEscribiendoOrigen(true);
    filtrarAeropuertosOrigen(valor);
  };

  const handleDestinoChange = (valor: string) => {
    setTextoDestino(valor);
    setEscribiendoDestino(true);
    filtrarAeropuertosDestino(valor);
  };

  const handleSeleccionarOrigen = (aeropuerto: Aeropuerto) => {
    seleccionarAeropuertoOrigen(aeropuerto);
    setTextoOrigen(`${aeropuerto.nombre} (${aeropuerto.codigo_iata})`);
    setEscribiendoOrigen(false);
  };

  const handleSeleccionarDestino = (aeropuerto: Aeropuerto) => {
    seleccionarAeropuertoDestino(aeropuerto);
    setTextoDestino(`${aeropuerto.nombre} (${aeropuerto.codigo_iata})`);
    setEscribiendoDestino(false);
  };

  const handleResetearOrigen = () => {
    resetearOrigen();
    setTextoOrigen("");
    setEscribiendoOrigen(false);
  };

  const handleResetearDestino = () => {
    resetearDestino();
    setTextoDestino("");
    setEscribiendoDestino(false);
  };

  const handleSubmitPersonalizado = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarCampos()) {
      handleSubmit(e, navigate, setShowConfirm, setSuccess);
    }
  };

  React.useEffect(() => {
    if (showConfirm) {
      showSuccessToast('¡Vuelo creado!', 'El vuelo se ha creado exitosamente');
      const timer = setTimeout(() => {
        setShowConfirm(false);
        navigate("/panelAdministrador");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm, navigate, showSuccessToast]);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modern-datepicker-custom {
          z-index: 9999 !important;
        }

        .react-datepicker-popper {
          z-index: 9999 !important;
        }

        .modern-calendar-custom.react-datepicker {
          border: none;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          font-family: inherit;
          overflow: hidden;
        }

        /* Header del calendario con gradiente y texto blanco */
        .modern-calendar-custom .react-datepicker__header {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%);
          border: none;
          border-radius: 0;
          padding: 20px 16px 16px;
        }

        .modern-calendar-custom .react-datepicker__current-month {
          color: white !important;
          font-weight: 700;
          font-size: 17px;
          margin-bottom: 12px;
          letter-spacing: 0.3px;
        }

        .modern-calendar-custom .react-datepicker__day-name {
          color: white !important;
          font-weight: 700;
          font-size: 13px;
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
        }

        /* Dropdowns de mes y año con texto blanco */
        .modern-calendar-custom .react-datepicker__month-dropdown-container,
        .modern-calendar-custom .react-datepicker__year-dropdown-container {
          margin: 0 5px;
        }

        .modern-calendar-custom .react-datepicker__month-read-view,
        .modern-calendar-custom .react-datepicker__year-read-view {
          color: white !important;
          font-weight: 700;
        }

        .modern-calendar-custom .react-datepicker__month-read-view--down-arrow,
        .modern-calendar-custom .react-datepicker__year-read-view--down-arrow {
          border-color: white transparent transparent;
          border-width: 0.35rem 0.35rem 0;
          top: 6px;
        }

        .modern-calendar-custom .react-datepicker__navigation-icon::before {
          border-color: white;
          border-width: 2px 2px 0 0;
        }

        .modern-calendar-custom .react-datepicker__navigation:hover *::before {
          border-color: rgba(255, 255, 255, 0.8);
        }

        /* Días del calendario */
        .modern-calendar-custom .react-datepicker__month {
          margin: 0;
          padding: 16px;
          background: white;
        }

        .modern-calendar-custom .react-datepicker__day {
          border-radius: 12px;
          transition: all 0.2s ease;
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          font-weight: 500;
          color: #374151;
        }

        .modern-calendar-custom .react-datepicker__day:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .modern-calendar-custom .react-datepicker__day--selected {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%) !important;
          color: white !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(18, 51, 97, 0.5);
        }

        .modern-calendar-custom .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .modern-calendar-custom .react-datepicker__day--today {
          background: rgba(59, 130, 246, 0.15);
          font-weight: 700;
          color: #1e40af;
          border: 2px solid #3b82f6;
        }

        .modern-calendar-custom .react-datepicker__day--today:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: transparent;
        }

        .modern-calendar-custom .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed;
        }

        .modern-calendar-custom .react-datepicker__day--disabled:hover {
          background: transparent !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .modern-calendar-custom .react-datepicker__day--outside-month {
          color: #d1d5db;
        }

        /* Dropdown de selección de mes/año con fondo oscuro y texto blanco */
        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background: linear-gradient(135deg, #0a1836 0%, #123361 100%);
          border: 2px solid #1180B8;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .react-datepicker__month-option,
        .react-datepicker__year-option {
          color: white !important;
          padding: 8px 12px;
          font-weight: 500;
        }

        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background: rgba(59, 130, 246, 0.3) !important;
          color: white !important;
        }

        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background: linear-gradient(135deg, #1180B8 0%, #0a8fc7 100%) !important;
          color: white !important;
          font-weight: 700;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          display: none;
        }

        /* Días del calendario */
        .modern-calendar-custom .react-datepicker__month {
          margin: 0;
          padding: 16px;
          background: white;
        }

        .modern-calendar-custom .react-datepicker__day {
          border-radius: 12px;
          transition: all 0.2s ease;
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          font-weight: 500;
          color: #374151;
        }

        .modern-calendar-custom .react-datepicker__day:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .modern-calendar-custom .react-datepicker__day--selected {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%) !important;
          color: white !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(18, 51, 97, 0.5);
        }

        .modern-calendar-custom .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .modern-calendar-custom .react-datepicker__day--today {
          background: rgba(59, 130, 246, 0.15);
          font-weight: 700;
          color: #1e40af;
          border: 2px solid #3b82f6;
        }

        .modern-calendar-custom .react-datepicker__day--today:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: transparent;
        }

        .modern-calendar-custom .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed;
        }

        .modern-calendar-custom .react-datepicker__day--disabled:hover {
          background: transparent !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .modern-calendar-custom .react-datepicker__day--outside-month {
          color: #d1d5db;
        }

        /* Contenedor de tiempo */
        .modern-calendar-custom .react-datepicker__time-container {
          border-left: 2px solid #e5e7eb;
          width: 100px;
        }

        .modern-calendar-custom .react-datepicker__time-container .react-datepicker__time {
          background: white;
          border-radius: 0 0 20px 0;
        }

        .modern-calendar-custom .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          width: 100%;
        }

        .modern-calendar-custom .react-datepicker__time-list-item {
          transition: all 0.2s ease;
          padding: 8px 10px;
          font-weight: 500;
        }

        .modern-calendar-custom .react-datepicker__time-list-item:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
        }

        .modern-calendar-custom .react-datepicker__time-list-item--selected {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%) !important;
          color: white !important;
          font-weight: 700;
        }

        /* Ocultar el indicador de tiempo en inputs */
        input[type="time"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          display: none;
        }

        /* Dropdown de selección de mes/año con fondo oscuro y texto blanco */
        .modern-calendar-custom .react-datepicker__month-read-view,
        .modern-calendar-custom .react-datepicker__year-read-view {
          color: white !important;
          font-weight: 700;
        }

        .modern-calendar-custom .react-datepicker__month-read-view--down-arrow,
        .modern-calendar-custom .react-datepicker__year-read-view--down-arrow {
          border-color: white transparent transparent;
          border-width: 0.35rem 0.35rem 0;
          top: 6px;
        }

        .react-datepicker__month-option,
        .react-datepicker__year-option {
          color: white !important;
          padding: 8px 12px;
          font-weight: 500;
        }

        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background: rgba(59, 130, 246, 0.3) !important;
          color: white !important;
        }

        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background: linear-gradient(135deg, #1180B8 0%, #0a8fc7 100%) !important;
          color: white !important;
          font-weight: 700;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-3xl mb-4 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
              Crear Nuevo Vuelo
            </h1>
            <p className="text-lg text-gray-600">Completa la información para registrar un nuevo vuelo en el sistema</p>
          </div>

          <form onSubmit={handleSubmitPersonalizado} className="space-y-8">
            {/* Card Principal */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              {/* Sección: Información Básica */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Información Básica</span>
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold  mb-2">
                      Título de la noticia
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={form.titulo || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.titulo ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400`}
                      placeholder="Ej: Nuevo vuelo Bogotá → Barranquilla"
                    />
                    {errores.titulo && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.titulo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Descripción corta
                    </label>
                    <input
                      type="text"
                      name="descripcion_corta"
                      value={form.descripcion_corta || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.descripcion_corta ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400`}
                      placeholder="Breve descripción del vuelo"
                    />
                    {errores.descripcion_corta && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.descripcion_corta}</p>}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Descripción larga
                    </label>
                    <textarea
                      name="descripcion_larga"
                      value={form.descripcion_larga || ""}
                      onChange={e => setForm((f: typeof form) => ({ ...f, descripcion_larga: e.target.value }))}
                      rows={4}
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.descripcion_larga ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none resize-none text-gray-900 font-medium placeholder:text-gray-400`}
                      placeholder="Detalles completos del servicio, frecuencias, servicios a bordo..."
                    />
                    {errores.descripcion_larga && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.descripcion_larga}</p>}
                  </div>
                </div>
              </div>

              {/* Sección: Detalles del Vuelo */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <PlaneIcon />
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Detalles del Vuelo</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Aeronave
                    </label>
                    <div className="relative">
                      <select
                        name="id_aeronaveFK"
                        value={form.id_aeronaveFK}
                        onChange={handleChange}
                        className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.id_aeronaveFK ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none appearance-none text-gray-900 font-medium`}
                      >
                        <option value="">Seleccionar aeronave</option>
                        {aeronaves.map((a) => (
                          <option key={a.id_aeronave} value={a.id_aeronave}>
                            {a.modelo} ({a.capacidad} pax)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#select-blue-gradient)">
                          <defs>
                            <linearGradient id="select-blue-gradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#123361" />
                              <stop offset="100%" stopColor="#1180B8" />
                            </linearGradient>
                          </defs>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errores.id_aeronaveFK && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.id_aeronaveFK}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Aeropuerto Origen
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={textoOrigen}
                        onChange={(e) => handleOrigenChange(e.target.value)}
                        onFocus={() => filtrarAeropuertosOrigen("")}
                        className={`w-full px-4 py-3.5 pr-11 bg-gray-50 border-2 ${errores.id_aeropuerto_origenFK ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400`}
                        placeholder="Buscar aeropuerto..."
                      />
                      {aeropuertoOrigenSeleccionado && (
                        <button
                          type="button"
                          onClick={handleResetearOrigen}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {!aeropuertoOrigenSeleccionado && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}
                      {sugerenciasOrigen.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border-2 border-blue-200 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-xl">
                          {sugerenciasOrigen.map((aeropuerto) => (
                            <div
                              key={aeropuerto.id_aeropuerto}
                              onClick={() => handleSeleccionarOrigen(aeropuerto)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-bold text-gray-900">{aeropuerto.nombre}</div>
                              <div className="text-sm text-gray-600">{aeropuerto.codigo_iata} - {aeropuerto.ciudad.nombre}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errores.id_aeropuerto_origenFK && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.id_aeropuerto_origenFK}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Aeropuerto Destino
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={textoDestino}
                        onChange={(e) => handleDestinoChange(e.target.value)}
                        onFocus={() => filtrarAeropuertosDestino("")}
                        disabled={!aeropuertoOrigenSeleccionado}
                        className={`w-full px-4 py-3.5 pr-11 bg-gray-50 border-2 ${errores.id_aeropuerto_destinoFK ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Buscar aeropuerto..."
                      />
                      {aeropuertoDestinoSeleccionado && (
                        <button
                          type="button"
                          onClick={handleResetearDestino}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {!aeropuertoDestinoSeleccionado && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}
                      {sugerenciasDestino.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border-2 border-blue-200 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-xl">
                          {sugerenciasDestino.map((aeropuerto) => (
                            <div
                              key={aeropuerto.id_aeropuerto}
                              onClick={() => handleSeleccionarDestino(aeropuerto)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-bold text-gray-900">{aeropuerto.nombre}</div>
                              <div className="text-sm text-gray-600">{aeropuerto.codigo_iata} - {aeropuerto.ciudad.nombre}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errores.id_aeropuerto_destinoFK && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.id_aeropuerto_destinoFK}</p>}
                  </div>
                </div>

                {errores.aeropuertos && (
                  <div className="mt-6 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
                    <p className="text-rose-600 font-semibold flex items-center gap-2">
                      <ErrorIcon />
                      {errores.aeropuertos}
                    </p>
                  </div>
                )}
              </div>

              {/* Sección: Fechas y Horarios */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Fechas y Horarios</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Salida */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                        Salida
                      </h3>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 space-y-4">
                      <div>
                        <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                          
                          Fecha de Salida
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={salidaDate}
                            onChange={date => {
                              if (date) {
                                if (salidaDate) {
                                  date.setHours(salidaDate.getHours(), salidaDate.getMinutes());
                                } else {
                                  date.setHours(6, 0);
                                }
                              }
                              setSalidaDate(date);
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                            className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.salida ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                            placeholderText="Selecciona fecha de salida"
                            popperClassName="modern-datepicker-custom"
                            calendarClassName="modern-calendar-custom"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            scrollableYearDropdown
                            yearDropdownItemNumber={15}
                            showPopperArrow={false}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-2)">
                              <defs>
                                <linearGradient id="gradient-icon-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-3)">
                              <defs>
                                <linearGradient id="gradient-icon-3" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                          Hora de Salida 
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={salidaDate ? salidaDate.toTimeString().substring(0, 5) : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = salidaDate ? new Date(salidaDate) : new Date();
                                newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                                setSalidaDate(newDate);
                              }
                            }}
                            className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.salida ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium`}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-5)">
                              <defs>
                                <linearGradient id="gradient-icon-5" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {errores.salida && <p className="text-rose-500 text-sm mt-2 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errores.salida}
                    </p>}
                  </div>

                  {/* Llegada */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                        Llegada
                      </h3>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 space-y-4">
                      <div>
                        <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                          Fecha de Llegada
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={llegadaDate}
                            onChange={date => {
                              if (date) {
                                if (llegadaDate) {
                                  date.setHours(llegadaDate.getHours(), llegadaDate.getMinutes());
                                } else {
                                  date.setHours(8, 0);
                                }
                              }
                              setLlegadaDate(date);
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={salidaDate || new Date()}
                            maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                            className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.llegada ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                            placeholderText="Selecciona fecha de llegada"
                            popperClassName="modern-datepicker-custom"
                            calendarClassName="modern-calendar-custom"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            scrollableYearDropdown
                            yearDropdownItemNumber={15}
                            showPopperArrow={false}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-7)">
                              <defs>
                                <linearGradient id="gradient-icon-7" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-8)">
                              <defs>
                                <linearGradient id="gradient-icon-8" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                          
                          Hora de Llegada
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={llegadaDate ? llegadaDate.toTimeString().substring(0, 5) : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = llegadaDate ? new Date(llegadaDate) : new Date();
                                newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                                setLlegadaDate(newDate);
                              }
                            }}
                            className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.llegada ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium`}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-icon-10)">
                              <defs>
                                <linearGradient id="gradient-icon-10" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0a1836" />
                                  <stop offset="50%" stopColor="#123361" />
                                  <stop offset="100%" stopColor="#081225" />
                                </linearGradient>
                              </defs>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {errores.llegada && <p className="text-rose-500 text-sm mt-2 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errores.llegada}
                    </p>}
                  </div>
                </div>
              </div>

            
              {/* Sección: Imagen */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <ImageIcon />
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Imagen del Vuelo</span>
                </h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    URL de la imagen
                  </label>
                  <input
                    type="url"
                    name="url_imagen"
                    value={form.url_imagen || ""}
                    onChange={e => setForm((f: typeof form) => ({ ...f, url_imagen: e.target.value }))}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.url_imagen ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {errores.url_imagen && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.url_imagen}</p>}
                  {form.url_imagen && (
                    <div className="mt-6 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-2xl p-6 border-2 border-[#123361]">
                      <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Vista previa:
                      </p>
                      <div className="relative rounded-xl overflow-hidden shadow-2xl">
                        <img 
                          src={form.url_imagen} 
                          alt="Preview" 
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección: Tarifas */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Tarifas</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tarifa Económica */}
                  <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-2xl p-6 border-2 border-[#123361] shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1180B8] to-[#0a1836] rounded-2xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">Económica</h3>
                        <p className="text-sm font-medium text-cyan-100">Tarifa estándar</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-brand-cyan">$</div>
                      <input
                        type="text"
                        placeholder="0"
                        value={form.tarifa[0].precio_base.toLocaleString("es-CO")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          handleTarifaChange("economica", Number(raw));
                        }}
                        className={`w-full px-4 py-4 pl-12 pr-20 bg-white border-2 ${errores.tarifa_economica ? 'border-brand-darkcyan' : 'border-brand-cyan'} rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none text-3xl font-black text-gray-900 placeholder:text-gray-300`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-cyan bg-brand-darkblue/30 px-3 py-1 rounded-lg">COP</span>
                    </div>
                    {errores.tarifa_economica && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.tarifa_economica}</p>}
                  </div>

                  {/* Tarifa Primera Clase */}
                  <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-2xl p-6 border-2 border-[#123361] shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1180B8] to-[#0a1836] rounded-2xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">Primera Clase</h3>
                        <p className="text-sm font-medium text-cyan-100">Tarifa premium</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-brand-cyan">$</div>
                      <input
                        type="text"
                        placeholder="0"
                        value={form.tarifa[1].precio_base.toLocaleString("es-CO")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          handleTarifaChange("primera_clase", Number(raw));
                        }}
                        className={`w-full px-4 py-4 pl-12 pr-20 bg-white border-2 ${errores.tarifa_premium ? 'border-brand-darkcyan' : 'border-brand-cyan'} rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none text-3xl font-black text-gray-900 placeholder:text-gray-300`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-cyan bg-brand-darkblue/30 px-3 py-1 rounded-lg">COP</span>
                    </div>
                    {errores.tarifa_premium && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.tarifa_premium}</p>}
                  </div>
                </div>
              </div>

              {/* Sección: Promoción */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-xl flex items-center justify-center shadow-lg">
                    <TagIcon />
                  </div>
                  <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">Promoción</span>
                </h2>

                <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#081225] rounded-2xl p-6 border-2 border-[#123361]">
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-2">
                      ¿Vuelo en promoción?
                    </label>
                    <div className="relative">
                      <select
                        name="promocion"
                        value={form.promocion ? "si" : "no"}
                        onChange={e => setForm((f: typeof form) => ({ ...f, promocion: e.target.value === "si" }))}
                        className="w-full px-4 py-3.5 bg-white border-2 border-brand-cyan rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none appearance-none text-gray-900 font-bold"
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {form.promocion && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">
                            Nombre de la promoción
                          </label>
                          <input
                            type="text"
                            value={form.promo_nombre || ""}
                            onChange={e => setForm((f: typeof form) => ({ ...f, promo_nombre: e.target.value }))}
                            className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promo_nombre ? 'border-brand-darkcyan' : 'border-brand-cyan'} rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none text-gray-900 font-semibold placeholder:text-gray-400`}
                            placeholder="Ej: Black November"
                          />
                          {errores.promo_nombre && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.promo_nombre}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-white mb-2">
                            Descuento (%)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={form.descuento || ""}
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                setForm((f: typeof form) => ({ ...f, descuento: val }));
                              }}
                              className={`w-full px-4 py-3.5 pr-12 bg-white border-2 ${errores.descuento ? 'border-brand-darkcyan' : 'border-brand-cyan'} rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none text-gray-900 font-bold placeholder:text-gray-400`}
                              placeholder="20"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-brand-cyan">%</span>
                          </div>
                          {errores.descuento && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.descuento}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Descripción de la promoción
                        </label>
                        <textarea
                          value={form.promo_descripcion || ""}
                          onChange={e => setForm((f: typeof form) => ({ ...f, promo_descripcion: e.target.value }))}
                          rows={3}
                          className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promo_descripcion ? 'border-brand-darkcyan' : 'border-brand-cyan'} rounded-xl focus:border-brand-darkcyan focus:ring-4 focus:ring-brand-cyan transition-all duration-200 outline-none resize-none text-gray-900 font-medium placeholder:text-gray-400`}
                          placeholder="Describe los detalles de la promoción..."
                        />
                        {errores.promo_descripcion && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.promo_descripcion}</p>}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Inicio de Promoción */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-bold text-white">
                              Inicio de Promoción
                            </h3>
                          </div>

                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 space-y-4">
                            <div>
                              <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-1)">
                                  <defs>
                                    <linearGradient id="gradient-promo-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#0a1836" />
                                      <stop offset="50%" stopColor="#123361" />
                                      <stop offset="100%" stopColor="#081225" />
                                    </linearGradient>
                                  </defs>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Fecha y Hora de Inicio
                              </label>
                              <div className="relative">
                                <DatePicker
                                  selected={form.promocion_inicio ? new Date(form.promocion_inicio) : null}
                                  onChange={date => setForm((f: typeof form) => ({ ...f, promocion_inicio: date ? date.toISOString() : "" }))}
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={15}
                                  dateFormat="dd/MM/yyyy HH:mm"
                                  minDate={new Date()}
                                  maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                                  className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.promocion_inicio ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                                  placeholderText="Selecciona fecha y hora de inicio"
                                  popperClassName="modern-datepicker-custom"
                                  calendarClassName="modern-calendar-custom"
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={15}
                                  showPopperArrow={false}
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-2)">
                                    <defs>
                                      <linearGradient id="gradient-promo-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0a1836" />
                                        <stop offset="50%" stopColor="#123361" />
                                        <stop offset="100%" stopColor="#081225" />
                                      </linearGradient>
                                    </defs>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-3)">
                                    <defs>
                                      <linearGradient id="gradient-promo-3" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0a1836" />
                                        <stop offset="50%" stopColor="#123361" />
                                        <stop offset="100%" stopColor="#081225" />
                                      </linearGradient>
                                    </defs>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          {errores.promocion_inicio && <p className="text-rose-500 text-sm mt-2 font-semibold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errores.promocion_inicio}
                          </p>}
                        </div>

                        {/* Fin de Promoción */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-bold text-white">
                              Fin de Promoción
                            </h3>
                          </div>

                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 space-y-4">
                            <div>
                              <label className="flex items-center gap-2 mb-3 font-bold text-sm bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] bg-clip-text text-transparent">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-4)">
                                  <defs>
                                    <linearGradient id="gradient-promo-4" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#0a1836" />
                                      <stop offset="50%" stopColor="#123361" />
                                      <stop offset="100%" stopColor="#081225" />
                                    </linearGradient>
                                  </defs>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Fecha y Hora de Fin
                              </label>
                              <div className="relative">
                                <DatePicker
                                  selected={form.promocion_fin ? new Date(form.promocion_fin) : null}
                                  onChange={date => setForm((f: typeof form) => ({ ...f, promocion_fin: date ? date.toISOString() : "" }))}
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={15}
                                  dateFormat="dd/MM/yyyy HH:mm"
                                  minDate={form.promocion_inicio ? new Date(form.promocion_inicio) : new Date()}
                                  maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                                  className={`w-full px-4 py-3.5 pl-12 bg-white border-2 ${errores.promocion_fin ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                                  placeholderText="Selecciona fecha y hora de fin"
                                  popperClassName="modern-datepicker-custom"
                                  calendarClassName="modern-calendar-custom"
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={15}
                                  showPopperArrow={false}
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-5)">
                                    <defs>
                                      <linearGradient id="gradient-promo-5" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0a1836" />
                                        <stop offset="50%" stopColor="#123361" />
                                        <stop offset="100%" stopColor="#081225" />
                                      </linearGradient>
                                    </defs>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="url(#gradient-promo-6)">
                                    <defs>
                                      <linearGradient id="gradient-promo-6" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0a1836" />
                                        <stop offset="50%" stopColor="#123361" />
                                        <stop offset="100%" stopColor="#081225" />
                                      </linearGradient>
                                    </defs>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          {errores.promocion_fin && <p className="text-rose-500 text-sm mt-2 font-semibold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errores.promocion_fin}
                          </p>}
                        </div>
                      </div>



                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes de error y éxito generales */}
            {error && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-center gap-3">
                <ErrorIcon />
                <p className="text-rose-600 font-semibold">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                <SuccessIcon />
                <p className="text-emerald-600 font-semibold">{success}</p>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/panelAdministrador")}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#081225] rounded-xl font-bold shadow-lg hover:shadow-xl border-2 border-[#123361] hover:border-[#0a1836] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="bg-white bg-clip-text text-transparent">Creando vuelo...</span>
                ) : (
                  <span className="bg-white bg-clip-text text-transparent">Crear Vuelo</span>
                )}
              </button>
            </div>
          </form>

          {/* Modal de Confirmación */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-6 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-3">¡Vuelo creado!</h3>
                  <p className="text-gray-600 mb-8 text-lg">El vuelo ha sido registrado exitosamente </p>
                  <button
                    onClick={() => { setShowConfirm(false); navigate("/panelAdministrador"); }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default CrearVueloPage;