import React, { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useCrearVuelo } from "../hooks/useCrearVuelo";
import { useAeropuertoValidation, type Aeropuerto } from "../hooks/useAeropuertoValidation";

// ================== ICONOS MODERNOS ==================
const CalendarIcon = () => (
  <svg
    className="w-6 h-6 text-[#39A5D8]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 2v3m8-3v3M3 10h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
    />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-5 h-5 text-[#39A5D8]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M12 6v6l4 2"
    />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

// ================== COMPONENTES DE TOAST MODERNOS ==================
const SuccessIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'border-green-500' : ''}
            ${toast.type === 'error' ? 'border-red-500' : ''}
            ${toast.type === 'warning' ? 'border-amber-500' : ''}
            animate-slide-in-right
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' && <SuccessIcon />}
              {toast.type === 'error' && <ErrorIcon />}
              {toast.type === 'warning' && <WarningIcon />}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CrearVueloPage: React.FC = () => {
  const [errores, setErrores] = React.useState<{ [key: string]: string }>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Funciones para manejar toasts modernos
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      removeToast(id);
    }, 5000);
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
  
  // Forzar formato de 24 horas en inputs de tiempo
  useEffect(() => {
    // Configurar el document para forzar formato de 24 horas
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

  // Hook de validación de aeropuertos con restricciones
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

  // Estados para mostrar lo que el usuario está escribiendo
  const [textoOrigen, setTextoOrigen] = React.useState("");
  const [textoDestino, setTextoDestino] = React.useState("");
  const [escribiendoOrigen, setEscribiendoOrigen] = React.useState(false);
  const [escribiendoDestino, setEscribiendoDestino] = React.useState(false);

    // Validación personalizada de campos obligatorios
    const validarCampos = () => {
      const nuevosErrores: { [key: string]: string } = {};
      
      // Validar aeropuertos con restricciones
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
      
      // Usar aeropuertos seleccionados del hook de validación
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
      // Validación de tarifas
      if (!form.tarifa[0].precio_base || Number(form.tarifa[0].precio_base) <= 0) {
        nuevosErrores.tarifa_economica = "La tarifa económica debe ser mayor a 0";
        showErrorToast('Error de validación', 'La tarifa económica debe ser mayor a 0');
      }
      if (!form.tarifa[1].precio_base || Number(form.tarifa[1].precio_base) <= 0) {
        nuevosErrores.tarifa_premium = "La tarifa premium debe ser mayor a 0";
        showErrorToast('Error de validación', 'La tarifa premium debe ser mayor a 0');
      }
      // Validación de promoción si aplica
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
      }
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

    // Efectos para sincronizar aeropuertos seleccionados con el formulario
    React.useEffect(() => {
      if (aeropuertoOrigenSeleccionado) {
        setForm((f: typeof form) => ({ ...f, id_aeropuerto_origenFK: aeropuertoOrigenSeleccionado.id_aeropuerto }));
        // Actualizar texto cuando se selecciona un aeropuerto
        if (!escribiendoOrigen) {
          setTextoOrigen(`${aeropuertoOrigenSeleccionado.nombre} (${aeropuertoOrigenSeleccionado.codigo_iata})`);
        }
      }
    }, [aeropuertoOrigenSeleccionado, setForm, form, escribiendoOrigen]);

    React.useEffect(() => {
      if (aeropuertoDestinoSeleccionado) {
        setForm((f: typeof form) => ({ ...f, id_aeropuerto_destinoFK: aeropuertoDestinoSeleccionado.id_aeropuerto }));
        // Actualizar texto cuando se selecciona un aeropuerto
        if (!escribiendoDestino) {
          setTextoDestino(`${aeropuertoDestinoSeleccionado.nombre} (${aeropuertoDestinoSeleccionado.codigo_iata})`);
        }
      }
    }, [aeropuertoDestinoSeleccionado, setForm, form, escribiendoDestino]);

    // Funciones auxiliares para manejar el texto de los inputs
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

    // Handler de submit personalizado
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
        navigate("/admin");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm, navigate, showSuccessToast]);


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8] flex justify-center items-center p-2 sm:p-4 md:p-8 lg:p-12 xl:p-20 animate-gradient-move">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 md:p-12 lg:p-16 xl:p-32 w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto border-2 border-[#39A5D8] flex flex-col gap-6 sm:gap-8 md:gap-12 lg:gap-16 transition-all duration-300">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F6899] mb-4 sm:mb-6 md:mb-8 text-center drop-shadow-lg">Crear Nuevo Vuelo</h2>
  <form onSubmit={handleSubmitPersonalizado} className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Datos de la noticia */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full mb-4">
            <div className="col-span-1">
              <label className="block mb-2 font-medium sm:font-semibold text-sm sm:text-base text-gray-900">Título de la noticia</label>
              {/* ...existing code... */}
              <input
                type="text"
                name="titulo"
                value={form.titulo || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-base sm:text-lg font-bold shadow-sm transition-all duration-200 ${errores.titulo ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="Ej: Nuevo vuelo Bogotá → Barranquilla"
              />
              {errores.titulo && <p className="text-red-500 text-xs sm:text-sm mt-1 font-semibold">{errores.titulo}</p>}
            </div>
            <div className="col-span-1">
              <label className="block mb-2 font-medium sm:font-semibold text-sm sm:text-base text-gray-900">Descripción corta</label>
              <input
                type="text"
                name="descripcion_corta"
                value={form.descripcion_corta || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white shadow-sm transition-all duration-200 ${errores.descripcion_corta ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="Ej: Paseos a la costa pa"
              />
              {errores.descripcion_corta && <p className="text-red-500 text-xs sm:text-sm mt-1 font-semibold">{errores.descripcion_corta}</p>}
            </div>
          </div>
          <div className="w-full mb-4">
            <label className="block mb-2 font-semibold text-gray-900">Descripción larga</label>
            <textarea
              name="descripcion_larga"
              value={form.descripcion_larga || ""}
              onChange={e => setForm((f: typeof form) => ({ ...f, descripcion_larga: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white min-h-[80px] shadow-sm transition-all duration-200 ${errores.descripcion_larga ? 'border-red-500' : 'border-[#39A5D8]'}`}
              placeholder="Detalles del servicio, frecuencias, servicios a bordo..."
              rows={3}
            />
            {errores.descripcion_larga && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.descripcion_larga}</p>}
          </div>
          
            
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <label className="block mb-2 font-medium text-sm sm:text-base text-gray-900">Aeronave</label>
              <select
                name="id_aeronaveFK"
                value={form.id_aeronaveFK}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-base sm:text-lg font-bold shadow-sm transition-all duration-200 ${errores.id_aeronaveFK ? 'border-red-500' : 'border-[#39A5D8]'}`}
              >
                <option value="">Selecciona una aeronave</option>
                {aeronaves.map((a) => (
                  <option key={a.id_aeronave} value={a.id_aeronave}>
                    {a.modelo} ({a.capacidad} pax)
                  </option>
                ))}
              </select>
              {errores.id_aeronaveFK && (
                <p className="mt-2 text-xs sm:text-sm text-red-500 font-medium bg-red-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-red-200">
                  {errores.id_aeronaveFK}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium text-sm sm:text-base text-gray-900">Aeropuerto Origen</label>
              <div className="relative">
                <input
                  type="text"
                  value={textoOrigen}
                  onChange={(e) => handleOrigenChange(e.target.value)}
                  onFocus={() => filtrarAeropuertosOrigen("")}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-base sm:text-lg font-bold shadow-sm transition-all duration-200 ${errores.id_aeropuerto_origenFK ? 'border-red-500' : 'border-[#39A5D8]'}`}
                  placeholder="Buscar aeropuerto de origen..."
                />
                {aeropuertoOrigenSeleccionado && (
                  <button
                    type="button"
                    onClick={handleResetearOrigen}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
                {sugerenciasOrigen.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border-2 border-[#39A5D8] rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {sugerenciasOrigen.map((aeropuerto) => (
                      <div
                        key={aeropuerto.id_aeropuerto}
                        onClick={() => handleSeleccionarOrigen(aeropuerto)}
                        className="px-4 py-3 hover:bg-[#39A5D8]/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-bold">{aeropuerto.nombre}</div>
                        <div className="text-sm text-gray-600">{aeropuerto.codigo_iata} - {aeropuerto.ciudad.nombre}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errores.id_aeropuerto_origenFK && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.id_aeropuerto_origenFK}</p>}
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium text-gray-900">Aeropuerto Destino</label>
              <div className="relative">
                <input
                  type="text"
                  value={textoDestino}
                  onChange={(e) => handleDestinoChange(e.target.value)}
                  onFocus={() => filtrarAeropuertosDestino("")}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.id_aeropuerto_destinoFK ? 'border-red-500' : 'border-[#39A5D8]'}`}
                  placeholder="Buscar aeropuerto de destino..."
                  disabled={!aeropuertoOrigenSeleccionado}
                />
                {aeropuertoDestinoSeleccionado && (
                  <button
                    type="button"
                    onClick={handleResetearDestino}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
                {sugerenciasDestino.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border-2 border-[#39A5D8] rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {sugerenciasDestino.map((aeropuerto) => (
                      <div
                        key={aeropuerto.id_aeropuerto}
                        onClick={() => handleSeleccionarDestino(aeropuerto)}
                        className="px-4 py-3 hover:bg-[#39A5D8]/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-bold">{aeropuerto.nombre}</div>
                        <div className="text-sm text-gray-600">{aeropuerto.codigo_iata} - {aeropuerto.ciudad.nombre}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errores.id_aeropuerto_destinoFK && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.id_aeropuerto_destinoFK}</p>}
            </div>
          </div>
          {/* Mostrar mensaje de error de aeropuertos si existe */}
          {errores.aeropuertos && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 font-semibold">{errores.aeropuertos}</p>
            </div>
          )}
          {/* Campo de imagen obligatorio como URL */}
          <div className="w-full">
            <label className="block mb-2 font-medium text-gray-900">URL de la imagen del vuelo</label>
            <input
              type="url"
              name="url_imagen"
              value={form.url_imagen || ""}
              onChange={e => setForm((f: typeof form) => ({ ...f, url_imagen: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white shadow-sm transition-all duration-200 ${errores.url_imagen ? 'border-red-500' : 'border-[#39A5D8]'}`}
              placeholder="https://..."
            />
            {errores.url_imagen && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.url_imagen}</p>}
            {form.url_imagen && (
              <div className="flex justify-center mt-4">
                <img src={form.url_imagen} alt="Preview" className="rounded-2xl shadow-xl border-2 border-[#39A5D8] w-full max-w-xs max-h-40 object-cover" />
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Campo de Fecha */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-xs sm:text-sm text-gray-700">
                    <CalendarIcon />
                    Fecha de Salida
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={salidaDate}
                      onChange={date => {
                        if (date) {
                          // Mantener la hora si ya existe
                          if (salidaDate) {
                            date.setHours(salidaDate.getHours(), salidaDate.getMinutes());
                          } else {
                            date.setHours(6, 0); // Hora por defecto 06:00 (formato 24h)
                          }
                        }
                        setSalidaDate(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                      className={`w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-base sm:text-lg font-bold shadow-sm transition-all duration-200 ${errores.salida ? 'border-red-500' : 'border-[#39A5D8]'}`}
                      placeholderText="Selecciona fecha de salida"
                      popperClassName="modern-datepicker"
                      calendarClassName="modern-calendar"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      scrollableYearDropdown
                      yearDropdownItemNumber={15}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>

                {/* Campo de Hora */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-900">
                    <ClockIcon />
                    Hora de Salida (UTC)
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
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.salida ? 'border-red-500' : 'border-[#39A5D8]'}`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ClockIcon />
                    </div>
                  </div>
                </div>
              </div>
              {errores.salida && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.salida}</p>}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo de Fecha */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-900">
                    <CalendarIcon />
                    Fecha de Llegada
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={llegadaDate}
                      onChange={date => {
                        if (date) {
                          // Mantener la hora si ya existe
                          if (llegadaDate) {
                            date.setHours(llegadaDate.getHours(), llegadaDate.getMinutes());
                          } else {
                            date.setHours(8, 0); // Hora por defecto 08:00 (formato 24h)
                          }
                        }
                        setLlegadaDate(date);
                      }}
                      dateFormat="dd/MM/yyyy"
                      minDate={salidaDate || new Date()}
                      maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.llegada ? 'border-red-500' : 'border-[#39A5D8]'}`}
                      placeholderText="Selecciona fecha de llegada"
                      popperClassName="modern-datepicker"
                      calendarClassName="modern-calendar"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      scrollableYearDropdown
                      yearDropdownItemNumber={15}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>

                {/* Campo de Hora */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-900">
                    <ClockIcon />
                    Hora de Llegada (UTC)
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
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.llegada ? 'border-red-500' : 'border-[#39A5D8]'}`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ClockIcon />
                    </div>
                  </div>
                </div>
              </div>
              {errores.llegada && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.llegada}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Precio Económica</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="0"
                  value={form.tarifa[0].precio_base.toLocaleString("es-CO")}
                  onChange={(e) => {
                    // Solo números, sin puntos ni comas
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    handleTarifaChange("economica", Number(raw));
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 pr-20 ${errores.tarifa_economica ? 'border-red-500' : 'border-[#39A5D8]'}`}
                />
                <span className="absolute right-4 text-gray-500 font-semibold">$ COP</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">Precio Primera Clase</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="0"
                  value={form.tarifa[1].precio_base.toLocaleString("es-CO")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    handleTarifaChange("primera_clase", Number(raw));
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 pr-20 ${errores.tarifa_premium ? 'border-red-500' : 'border-[#39A5D8]'}`}
                />
                <span className="absolute right-4 text-gray-500 font-semibold">$ COP</span>
              </div>
            </div>


          </div>

          {/* Apartado de Promoción */}
            <div className="w-full mt-8">
              <div className="bg-gradient-to-r from-[#eaf6ff] via-[#b6d6f2] to-[#0F6899] rounded-2xl shadow-xl p-10 border border-[#b6d6f2] flex flex-col gap-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center font-sans drop-shadow-lg">Promoción del vuelo</h3>
                <div className="flex-1 min-w-[180px] mb-6">
                  <label className="block mb-2 font-medium">¿Vuelo en promoción?</label>
                  <select
                    name="promocion"
                    value={form.promocion ? "si" : "no"}
                    onChange={e => setForm((f: typeof form) => ({ ...f, promocion: e.target.value === "si" }))}
                    className="w-full px-4 py-3 border border-[#b6d6f2] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent bg-white"
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                {form.promocion && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <label className="block mb-2 font-medium">Nombre de la promoción</label>
                        <input
                          type="text"
                          value={form.promo_nombre || ""}
                          onChange={e => setForm((f: typeof form) => ({ ...f, promo_nombre: e.target.value }))}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promo_nombre ? 'border-red-500' : 'border-[#39A5D8]'}`}
                          placeholder="Ej: Black November"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Descripción de la promoción</label>
                        <textarea
                          value={form.promo_descripcion || ""}
                          onChange={e => setForm((f: typeof form) => ({ ...f, promo_descripcion: e.target.value }))}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promo_descripcion ? 'border-red-500' : 'border-[#39A5D8]'}`}
                          placeholder="Describe la promoción"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-end">
                      <div>
                        <label className="block mb-2 font-medium">Descuento (%)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={form.descuento || ""}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setForm((f: typeof form) => ({ ...f, descuento: val }));
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 appearance-none ${errores.descuento ? 'border-red-500' : 'border-[#39A5D8]'}`}
                          placeholder="Ej: 20"
                        />
                      </div>
                      <div className="md:ml-10">
                        <label className="block mb-2 font-medium">Inicio promoción</label>
                        <DatePicker
                          selected={form.promocion_inicio ? new Date(form.promocion_inicio) : null}
                          onChange={date => setForm((f: typeof form) => ({ ...f, promocion_inicio: date ? date.toISOString() : "" }))}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="yyyy-MM-dd HH:mm"
                          minDate={new Date()}
                          maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promocion_inicio ? 'border-red-500' : 'border-[#39A5D8]'}`}
                          placeholderText="Selecciona fecha y hora"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-medium">Fin promoción</label>
                        <DatePicker
                          selected={form.promocion_fin ? new Date(form.promocion_fin) : null}
                          onChange={date => setForm((f: typeof form) => ({ ...f, promocion_fin: date ? date.toISOString() : "" }))}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="yyyy-MM-dd HH:mm"
                          minDate={form.promocion_inicio ? new Date(form.promocion_inicio) : new Date()}
                          maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promocion_fin ? 'border-red-500' : 'border-[#39A5D8]'}`}
                          placeholderText="Selecciona fecha y hora"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          {error && <p className="text-red-600 font-medium">{error}</p>}
          {success && <p className="text-green-600 font-medium">{success}</p>}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => navigate("/panelAdministrador")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#eaf6ff] to-[#39A5D8] text-[#0F6899] rounded-lg sm:rounded-xl font-bold shadow hover:scale-105 hover:bg-[#39A5D8]/80 transition-all duration-300 border-2 border-[#39A5D8] text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg sm:rounded-xl font-bold shadow hover:scale-105 hover:shadow-[#3B82F6]/20 transition-all duration-300 border-2 border-[#39A5D8] text-sm sm:text-base"
            >
              {loading ? "Creando..." : "Crear Vuelo"}
            </button>
          </div>
        </form>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-sm sm:max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#0F6899]">¡Vuelo creado exitosamente!</h3>
              <p className="mb-4 text-sm sm:text-base text-gray-600">El vuelo ha sido registrado y será visible en el panel de administración.</p>
              <button
                onClick={() => { setShowConfirm(false); navigate("/admin"); }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg font-bold text-sm sm:text-base"
              >Aceptar</button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modern DatePicker Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .modern-datepicker {
            z-index: 9999 !important;
          }
          
          .modern-calendar {
            background: white;
            border: 2px solid #39A5D8;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .react-datepicker__header {
            background: linear-gradient(135deg, #0F6899 0%, #39A5D8 100%);
            border-bottom: none;
            border-radius: 14px 14px 0 0;
            color: white;
            padding: 16px;
          }
          
          .react-datepicker__current-month {
            color: white;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 8px;
          }
          
          .react-datepicker__day-names {
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 8px;
          }
          
          .react-datepicker__day-name {
            color: white;
            font-weight: 600;
            width: 2.5rem;
            line-height: 2rem;
          }
          
          .react-datepicker__day {
            width: 2.5rem;
            height: 2.5rem;
            line-height: 2.5rem;
            margin: 2px;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
          }
          
          .react-datepicker__day:hover {
            background: #F18802;
            color: white;
            transform: scale(1.1);
          }
          
          .react-datepicker__day--selected {
            background: linear-gradient(135deg, #F18802 0%, #FF9500 100%);
            color: white;
            font-weight: 700;
            transform: scale(1.05);
          }
          
          .react-datepicker__day--today {
            background: rgba(57, 165, 216, 0.2);
            color: #0F6899;
            font-weight: 700;
          }
          
          .react-datepicker__time-container {
            border-left: 2px solid #39A5D8;
            background: #f8fafc;
          }
          
          .react-datepicker__time {
            background: white;
            border-radius: 0 0 14px 0;
          }
          
          .react-datepicker__time-box {
            border-radius: 0 0 14px 0;
          }
          
          .react-datepicker__time-list-item {
            padding: 8px 16px;
            transition: all 0.2s ease;
            font-weight: 500;
          }
          
          .react-datepicker__time-list-item:hover {
            background: #F18802;
            color: white;
          }
          
          .react-datepicker__time-list-item--selected {
            background: linear-gradient(135deg, #0F6899 0%, #39A5D8 100%);
            color: white;
            font-weight: 700;
          }
          
          .react-datepicker__navigation {
            top: 20px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            width: 32px;
            height: 32px;
            transition: all 0.2s ease;
          }
          
          .react-datepicker__navigation:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
          }
          
          .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 2px 2px 0 0;
          }
          
          .react-datepicker__dropdown {
            background: white;
            border: 2px solid #39A5D8;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          
          .react-datepicker__dropdown-option {
            padding: 8px 16px;
            transition: all 0.2s ease;
            font-weight: 500;
          }
          
          .react-datepicker__dropdown-option:hover {
            background: #F18802;
            color: white;
          }
          
          .react-datepicker__dropdown-option--selected {
            background: linear-gradient(135deg, #0F6899 0%, #39A5D8 100%);
            color: white;
            font-weight: 700;
          }
          
          /* Modern Time Input Styles */
          input[type="time"] {
            color-scheme: light dark;
            font-family: 'Oswald', sans-serif;
            font-weight: 600;
            letter-spacing: 1px;
            text-align: center;
          }
          
          input[type="time"]::-webkit-calendar-picker-indicator {
            background: transparent;
            color: #39A5D8;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.8;
            transition: opacity 0.2s ease;
          }
          
          input[type="time"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
            color: #F18802;
          }
          
          input[type="time"]:focus::-webkit-calendar-picker-indicator {
            color: #F18802;
          }
          
          input[type="time"]::-webkit-datetime-edit {
            color: #0F6899;
            font-weight: 700;
          }
          
          input[type="time"]::-webkit-datetime-edit-hour-field,
          input[type="time"]::-webkit-datetime-edit-minute-field {
            background: rgba(57, 165, 216, 0.1);
            border-radius: 6px;
            padding: 4px 6px;
            margin: 0 2px;
            transition: all 0.2s ease;
          }
          
          input[type="time"]::-webkit-datetime-edit-hour-field:focus,
          input[type="time"]::-webkit-datetime-edit-minute-field:focus {
            background: rgba(241, 136, 2, 0.2);
            outline: none;
            transform: scale(1.05);
          }
          
          input[type="time"]::-webkit-datetime-edit-text {
            color: #39A5D8;
            font-weight: 700;
            padding: 0 4px;
            font-size: 1.1rem;
          }
        `
      }} />
      
      {/* Toast Container para notificaciones modernas */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );


}
export default CrearVueloPage;
