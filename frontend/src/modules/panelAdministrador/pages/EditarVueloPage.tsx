import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEditarVuelo } from "../hooks/useEditarVuelo";
import { formatearDuracion } from "../flightDuration";
import { useAeropuertoValidation } from "../hooks/useAeropuertoValidation";
import type { Aeropuerto } from "../hooks/useAeropuertoValidation";

// Iconos modernos
const PlaneIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const EditarVueloPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    vuelo,
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
    puedeEditar,
    tieneVentas,
  } = useEditarVuelo(id);

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // Hook para aeropuertos con funciones de filtrado y selección
  const {
    aeropuertos,
    aeropuertosLoaded,
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
  } = useAeropuertoValidation();

  // Estados para el texto de búsqueda de aeropuertos
  const [textoOrigen, setTextoOrigen] = useState("");
  const [textoDestino, setTextoDestino] = useState("");
  
  // Flag para saber si ya se cargaron los aeropuertos iniciales del vuelo
  const [aeropuertosInicializados, setAeropuertosInicializados] = useState(false);

  // Estados para subir imagen
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para guardar la duración del vuelo (calculada al cargar)
  const [duracionVuelo, setDuracionVuelo] = useState<number | null>(null);

  // Funciones para manejar selección de aeropuertos
  const handleSeleccionarOrigen = (aeropuerto: Aeropuerto) => {
    seleccionarAeropuertoOrigen(aeropuerto);
    setTextoOrigen(`${aeropuerto.ciudad.nombre} - ${aeropuerto.nombre} (${aeropuerto.codigo_iata})`);
    if (form) {
      setForm({ ...form, id_aeropuerto_origenFK: aeropuerto.id_aeropuerto });
    }
  };

  const handleSeleccionarDestino = (aeropuerto: Aeropuerto) => {
    seleccionarAeropuertoDestino(aeropuerto);
    setTextoDestino(`${aeropuerto.ciudad.nombre} - ${aeropuerto.nombre} (${aeropuerto.codigo_iata})`);
    if (form) {
      setForm({ ...form, id_aeropuerto_destinoFK: aeropuerto.id_aeropuerto });
    }
  };

  const handleResetearOrigen = () => {
    resetearOrigen();
    setTextoOrigen("");
    if (form) {
      setForm({ ...form, id_aeropuerto_origenFK: 0 });
    }
  };

  const handleResetearDestino = () => {
    resetearDestino();
    setTextoDestino("");
    if (form) {
      setForm({ ...form, id_aeropuerto_destinoFK: 0 });
    }
  };

  const handleOrigenChange = (valor: string) => {
    setTextoOrigen(valor);
    filtrarAeropuertosOrigen(valor);
  };

  const handleDestinoChange = (valor: string) => {
    setTextoDestino(valor);
    filtrarAeropuertosDestino(valor);
  };

  // Función para subir imagen a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const url = "https://api.cloudinary.com/v1_1/dycqxw0aj/image/upload";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Swokowsky-bucket");
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Error al subir imagen: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("No se recibió la URL de la imagen");
    return data.secure_url;
  };

  // Manejar selección de archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    setImagenFile(file);
    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    setSubiendoImagen(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setForm((f: typeof form) => ({ ...f!, url_imagen: cloudinaryUrl }));
    } catch (err) {
      alert('No se pudo subir la imagen. Intenta de nuevo.');
      setImagenFile(null);
      setImagenPreview(null);
    } finally {
      setSubiendoImagen(false);
    }
  };

  // Eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setImagenFile(null);
    setImagenPreview(null);
    setForm((f: typeof form) => ({ ...f!, url_imagen: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Efecto para cargar datos del vuelo y calcular duración inicial
  useEffect(() => {
    if (vuelo && !duracionVuelo) {
      const salida = vuelo.salida_programada_utc ? new Date(vuelo.salida_programada_utc) : null;
      const llegada = vuelo.llegada_programada_utc ? new Date(vuelo.llegada_programada_utc) : null;
      
      // Calcular y guardar la duración del vuelo original
      if (salida && llegada) {
        const diffMs = llegada.getTime() - salida.getTime();
        if (diffMs > 0) {
          setDuracionVuelo(Math.floor(diffMs / (1000 * 60))); // Duración en minutos
        }
      }
    }
  }, [vuelo, duracionVuelo]);

  // Efecto para buscar los nombres de aeropuertos cuando se cargan (solo una vez al inicio)
  useEffect(() => {
    if (aeropuertosLoaded && form && form.id_aeropuerto_origenFK && form.id_aeropuerto_destinoFK && !aeropuertosInicializados) {
      const origen = aeropuertos.find(a => a.id_aeropuerto === form.id_aeropuerto_origenFK);
      const destino = aeropuertos.find(a => a.id_aeropuerto === form.id_aeropuerto_destinoFK);
      if (origen) {
        seleccionarAeropuertoOrigen(origen);
        setTextoOrigen(`${origen.ciudad.nombre} - ${origen.nombre} (${origen.codigo_iata})`);
      }
      if (destino) {
        seleccionarAeropuertoDestino(destino);
        setTextoDestino(`${destino.ciudad.nombre} - ${destino.nombre} (${destino.codigo_iata})`);
      }
      // Marcar como inicializados para no volver a ejecutar
      setAeropuertosInicializados(true);
    }
  }, [aeropuertosLoaded, aeropuertos, form, aeropuertosInicializados]);

  // Efecto para recalcular llegada cuando cambia la salida
  useEffect(() => {
    if (salidaDate && duracionVuelo !== null && duracionVuelo > 0) {
      const nuevaLlegada = new Date(salidaDate.getTime() + duracionVuelo * 60 * 1000);
      setLlegadaDate(nuevaLlegada);
    }
  }, [salidaDate, duracionVuelo, setLlegadaDate]);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => {
        setShowConfirm(false);
        navigate("/panelAdministrador");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showConfirm, navigate]);

  // Loading state moderno
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-bold text-gray-700">Cargando datos del vuelo...</p>
        </div>
      </div>
    );
  }

  // Error state moderno
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-rose-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate("/panelAdministrador")} className="px-6 py-3 bg-gradient-to-r from-[#0a1836] to-[#123361] text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Volver</button>
        </div>
      </div>
    );
  }

  // No form loaded
  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700">No se encontró información del vuelo.</p>
        </div>
      </div>
    );
  }

  // Validación personalizada
  const validarCampos = () => {
    if (!form) return false;
    const nuevosErrores: { [key: string]: string } = {};
    if (!form.titulo || form.titulo.trim() === "") {
      nuevosErrores.titulo = "El título es obligatorio";
    }
    if (!form.descripcion_corta || form.descripcion_corta.trim() === "") {
      nuevosErrores.descripcion_corta = "La descripción corta es obligatoria";
    }
    if (!form.descripcion_larga || form.descripcion_larga.trim() === "") {
      nuevosErrores.descripcion_larga = "La descripción larga es obligatoria";
    }
    if (!form.url_imagen || form.url_imagen.trim() === "") {
      nuevosErrores.url_imagen = "La URL de la imagen es obligatoria";
    }
    if (!form.id_aeropuerto_origenFK) {
      nuevosErrores.id_aeropuerto_origenFK = "Selecciona el aeropuerto de origen";
    }
    if (!form.id_aeropuerto_destinoFK) {
      nuevosErrores.id_aeropuerto_destinoFK = "Selecciona el aeropuerto de destino";
    }
    if (!salidaDate) {
      nuevosErrores.salida = "Selecciona la fecha de salida";
    }
    if (!llegadaDate) {
      nuevosErrores.llegada = "Selecciona la fecha de llegada";
    }
    if (!form.tarifa[0].precio_base || Number(form.tarifa[0].precio_base) <= 0) {
      nuevosErrores.tarifa_economica = "La tarifa económica debe ser mayor a 0";
    }
    if (!form.tarifa[1].precio_base || Number(form.tarifa[1].precio_base) <= 0) {
      nuevosErrores.tarifa_premium = "La tarifa premium debe ser mayor a 0";
    }
    if (form.promocion) {
      if (!form.promo_nombre || form.promo_nombre.trim() === "") {
        nuevosErrores.promo_nombre = "El nombre de la promoción es obligatorio";
      }
      if (!form.promo_descripcion || form.promo_descripcion.trim() === "") {
        nuevosErrores.promo_descripcion = "La descripción de la promoción es obligatoria";
      }
      const descuentoNum = Number(form.descuento);
      if (!form.descuento || descuentoNum < 1 || descuentoNum > 99) {
        nuevosErrores.descuento = "El descuento debe estar entre 1% y 99%";
      }
      if (!form.promocion_inicio) {
        nuevosErrores.promocion_inicio = "La fecha de inicio es obligatoria";
      }
      if (!form.promocion_fin) {
        nuevosErrores.promocion_fin = "La fecha de fin es obligatoria";
      }
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmitPersonalizado = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarCampos()) {
      handleSubmit(e, true, navigate, setShowConfirm, () => {});
    }
  };

  // Solo bloquear completamente si el vuelo NO está programado (ya despegó, aterrizó o fue cancelado)
  // Si tiene ventas pero está programado, se permite editar solo la promoción
  if (!puedeEditar && !tieneVentas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-600 mb-4">No se puede editar este vuelo</h2>
          <p className="text-gray-600 mb-6">El vuelo ya no está en estado "Programado". No se puede modificar.</p>
          <button onClick={() => navigate("/panelAdministrador")} className="px-6 py-3 bg-gradient-to-r from-[#0a1836] to-[#123361] text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .modern-calendar-custom.react-datepicker {
          border: none;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          font-family: inherit;
          overflow: hidden;
        }
        .modern-calendar-custom .react-datepicker__header {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%);
          border: none;
          padding: 20px 16px 16px;
        }
        .modern-calendar-custom .react-datepicker__current-month {
          color: white !important;
          font-weight: 700;
          font-size: 17px;
          margin-bottom: 12px;
        }
        .modern-calendar-custom .react-datepicker__day-name {
          color: white !important;
          font-weight: 700;
        }
        .modern-calendar-custom .react-datepicker__day--selected {
          background: linear-gradient(135deg, #0a1836 0%, #123361 60%, #1180B8 100%) !important;
          color: white !important;
          font-weight: 700;
        }
        .modern-calendar-custom .react-datepicker__day:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header moderno */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-3xl mb-4 shadow-xl">
              <PlaneIcon />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">
              Editar Vuelo
            </h1>
            <p className="text-lg text-gray-600">Modifica la información del vuelo seleccionado</p>
          </div>

          {/* Banner de advertencia cuando hay ventas */}
          {tieneVentas && (
            <div className="mb-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-black mb-1">⚠️ Este vuelo tiene ventas registradas</h3>
                  <p className="text-amber-100 font-medium">
                    No se pueden editar los campos del vuelo porque ya existen tiquetes vendidos. 
                    Solo puedes modificar la <span className="font-bold text-white">promoción</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitPersonalizado} className="space-y-8">
            {/* Card: Información Básica */}
            <div className={`bg-white rounded-3xl shadow-xl p-8 border border-gray-100 ${tieneVentas ? 'opacity-60' : ''}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">Información Básica</span>
                {tieneVentas && <span className="ml-2 text-sm font-medium text-amber-500">🔒 Bloqueado</span>}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Título de la noticia</label>
                  <input
                    type="text"
                    name="titulo"
                    value={form?.titulo || ""}
                    onChange={handleChange}
                    disabled={tieneVentas}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.titulo ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    placeholder="Ej: Nuevo vuelo Bogotá → Barranquilla"
                  />
                  {errores.titulo && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.titulo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descripción corta</label>
                  <input
                    type="text"
                    name="descripcion_corta"
                    value={form?.descripcion_corta || ""}
                    onChange={handleChange}
                    disabled={tieneVentas}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.descripcion_corta ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    placeholder="Breve descripción del vuelo"
                  />
                  {errores.descripcion_corta && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.descripcion_corta}</p>}
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descripción larga</label>
                  <textarea
                    name="descripcion_larga"
                    value={form?.descripcion_larga || ""}
                    onChange={e => setForm(f => ({ ...f!, descripcion_larga: e.target.value }))}
                    disabled={tieneVentas}
                    rows={4}
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 ${errores.descripcion_larga ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none resize-none text-gray-900 font-medium placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    placeholder="Detalles completos del servicio..."
                  />
                  {errores.descripcion_larga && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.descripcion_larga}</p>}
                </div>
              </div>
            </div>

            {/* Card: Ruta y Horarios */}
            <div className={`bg-white rounded-3xl shadow-xl p-8 border border-gray-100 ${tieneVentas ? 'opacity-60' : ''}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">Ruta y Horarios</span>
                {tieneVentas && <span className="ml-2 text-sm font-medium text-amber-500">🔒 Bloqueado</span>}
              </h2>
              
              {/* Selectores de aeropuertos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Aeropuerto Origen */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🛤 Aeropuerto Origen
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={textoOrigen}
                      onChange={(e) => handleOrigenChange(e.target.value)}
                      onFocus={() => !tieneVentas && filtrarAeropuertosOrigen("")}
                      disabled={tieneVentas}
                      className={`w-full px-4 py-3.5 pr-11 bg-gray-50 border-2 ${errores.id_aeropuerto_origenFK ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100`}
                      placeholder="Buscar aeropuerto de origen..."
                    />
                    {aeropuertoOrigenSeleccionado && !tieneVentas ? (
                      <button
                        type="button"
                        onClick={handleResetearOrigen}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    )}
                    {sugerenciasOrigen.length > 0 && !tieneVentas && (
                      <div className="absolute z-20 w-full bg-white border-2 border-blue-200 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-xl">
                        {sugerenciasOrigen.map((aeropuerto) => (
                          <div
                            key={aeropuerto.id_aeropuerto}
                            onClick={() => handleSeleccionarOrigen(aeropuerto)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-bold text-gray-900">{aeropuerto.ciudad.nombre}</div>
                            <div className="text-sm text-gray-600">{aeropuerto.nombre} ({aeropuerto.codigo_iata})</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errores.id_aeropuerto_origenFK && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.id_aeropuerto_origenFK}</p>}
                </div>

                {/* Aeropuerto Destino */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🛬 Aeropuerto Destino
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={textoDestino}
                      onChange={(e) => handleDestinoChange(e.target.value)}
                      onFocus={() => !tieneVentas && filtrarAeropuertosDestino("")}
                      disabled={!aeropuertoOrigenSeleccionado || tieneVentas}
                      className={`w-full px-4 py-3.5 pr-11 bg-gray-50 border-2 ${errores.id_aeropuerto_destinoFK ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100`}
                      placeholder={aeropuertoOrigenSeleccionado ? "Buscar aeropuerto de destino..." : "Primero selecciona el origen"}
                    />
                    {aeropuertoDestinoSeleccionado && !tieneVentas ? (
                      <button
                        type="button"
                        onClick={handleResetearDestino}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    )}
                    {sugerenciasDestino.length > 0 && !tieneVentas && (
                      <div className="absolute z-20 w-full bg-white border-2 border-blue-200 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-xl">
                        {sugerenciasDestino.map((aeropuerto) => (
                          <div
                            key={aeropuerto.id_aeropuerto}
                            onClick={() => handleSeleccionarDestino(aeropuerto)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-bold text-gray-900">{aeropuerto.ciudad.nombre}</div>
                            <div className="text-sm text-gray-600">{aeropuerto.nombre} ({aeropuerto.codigo_iata})</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errores.id_aeropuerto_destinoFK && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.id_aeropuerto_destinoFK}</p>}
                </div>
              </div>
              
              {/* Fecha de salida */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">🛫 Salida Programada (UTC)</label>
                <div className="relative">
                  <DatePicker
                    selected={salidaDate}
                    onChange={date => setSalidaDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                    disabled={tieneVentas}
                    className={`w-full px-4 py-3.5 pl-12 bg-gray-50 border-2 ${errores.salida ? 'border-rose-500' : 'border-gray-200'} rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100`}
                    placeholderText="Selecciona fecha y hora de salida"
                    calendarClassName="modern-calendar-custom"
                    popperClassName="z-50"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {errores.salida && <p className="text-rose-500 text-sm mt-2 font-semibold">{errores.salida}</p>}
              </div>

              {/* Indicador de duración y llegada calculada */}
              {duracionVuelo !== null && duracionVuelo > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center justify-between text-white gap-4">
                    {/* Duración */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-100">Duración del vuelo</p>
                        <p className="text-2xl font-black">{formatearDuracion(duracionVuelo)}</p>
                      </div>
                    </div>
                    
                    {/* Flecha */}
                    <div className="hidden md:block">
                      <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    
                    {/* Llegada calculada */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-100">🛬 Llegada estimada (UTC)</p>
                        <p className="text-2xl font-black">
                          {llegadaDate ? llegadaDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + llegadaDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--'}
                        </p>
                      </div>
                    </div>
                  </div>
                 
                </div>
              )}
            </div>

            {/* Card: Imagen */}
            <div className={`bg-white rounded-3xl shadow-xl p-8 border border-gray-100 ${tieneVentas ? 'opacity-60' : ''}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">Imagen del Vuelo</span>
                {tieneVentas && <span className="ml-2 text-sm font-medium text-amber-500">🔒 Bloqueado</span>}
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Seleccionar imagen <span className="text-rose-500">*</span>
                </label>
                
                {/* Input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="imagen-vuelo-editar"
                />
                
                {/* Zona de drop / selector */}
                {!imagenPreview && !form.url_imagen ? (
                  <div 
                    onClick={() => !tieneVentas && fileInputRef.current?.click()}
                    className={`w-full px-6 py-12 bg-gray-50 border-2 border-dashed ${errores.url_imagen ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-blue-400'} rounded-2xl ${tieneVentas ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-50'} transition-all duration-200 group`}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0a1836] to-[#123361] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-bold text-gray-700 mb-1">
                        {subiendoImagen ? 'Subiendo imagen...' : 'Haz clic para seleccionar una imagen'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Formatos permitidos: JPG, PNG, GIF, WEBP (máx. 5MB)
                      </p>
                      {subiendoImagen && (
                        <div className="mt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Vista previa de imagen */
                  <div className="mt-2 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-2xl p-6 border-2 border-[#123361]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Vista previa
                      </p>
                      <div className="flex gap-2">
                        {!tieneVentas && (
                          <>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Cambiar
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative rounded-xl overflow-hidden shadow-2xl">
                      <img 
                        src={imagenPreview || form.url_imagen} 
                        alt="Vista previa del vuelo" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      {imagenFile && (
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <p className="text-white text-sm font-medium">{imagenFile.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {errores.url_imagen && (
                  <p className="text-rose-500 text-sm mt-2 font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errores.url_imagen}
                  </p>
                )}
              </div>
            </div>

            {/* Card: Tarifas */}
            <div className={`bg-white rounded-3xl shadow-xl p-8 border border-gray-100 ${tieneVentas ? 'opacity-60' : ''}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">Tarifas</span>
                {tieneVentas && <span className="ml-2 text-sm font-medium text-amber-500">🔒 Bloqueado</span>}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarifa Económica */}
                <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Económica</h3>
                      <p className="text-sm text-cyan-100">Tarifa estándar</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-400">$</div>
                    <input
                      type="text"
                      placeholder="0"
                      value={form?.tarifa[0]?.precio_base?.toLocaleString("es-CO") || "0"}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        handleTarifaChange("economica", Number(raw));
                      }}
                      disabled={tieneVentas}
                      className={`w-full px-4 py-4 pl-12 pr-20 bg-white border-2 ${errores.tarifa_economica ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-2xl font-black text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">COP</span>
                  </div>
                  {errores.tarifa_economica && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.tarifa_economica}</p>}
                </div>

                {/* Tarifa Primera Clase */}
                <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Primera Clase</h3>
                      <p className="text-sm text-cyan-100">Tarifa premium</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-400">$</div>
                    <input
                      type="text"
                      placeholder="0"
                      value={form?.tarifa[1]?.precio_base?.toLocaleString("es-CO") || "0"}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        handleTarifaChange("primera_clase", Number(raw));
                      }}
                      disabled={tieneVentas}
                      className={`w-full px-4 py-4 pl-12 pr-20 bg-white border-2 ${errores.tarifa_premium ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-2xl font-black text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">COP</span>
                  </div>
                  {errores.tarifa_premium && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.tarifa_premium}</p>}
                </div>
              </div>
            </div>

            {/* Card: Promoción */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] bg-clip-text text-transparent">Promoción</span>
              </h2>

              <div className="bg-gradient-to-br from-[#0a1836] via-[#123361] to-[#1180B8] rounded-2xl p-6">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-white mb-2">¿Vuelo en promoción?</label>
                  <select
                    name="promocion"
                    value={form?.promocion ? "si" : "no"}
                    onChange={e => setForm(f => ({ ...f!, promocion: e.target.value === "si" }))}
                    className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none appearance-none text-gray-900 font-bold cursor-pointer"
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>

                {form?.promocion && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Nombre de la promoción</label>
                        <input
                          type="text"
                          name="promo_nombre"
                          value={form?.promo_nombre || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promo_nombre ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium`}
                          placeholder="Ej: Black November"
                        />
                        {errores.promo_nombre && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.promo_nombre}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Descuento (%) <span className="text-cyan-200 font-normal">máx. 99%</span></label>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="descuento"
                          value={form?.descuento || ""}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/[^0-9]/g, ""); // Solo números
                            const numero = parseInt(valor, 10);
                            // Solo actualizar si está vacío o es un número válido entre 1-99
                            if (valor === "" || (numero >= 1 && numero <= 99)) {
                              setForm(f => ({ ...f!, descuento: valor }));
                            }
                          }}
                          maxLength={2}
                          className={`w-full px-4 py-3.5 bg-white border-2 ${errores.descuento ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-bold`}
                          placeholder="1-99"
                        />
                        {errores.descuento && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.descuento}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Descripción de la promoción</label>
                      <textarea
                        name="promo_descripcion"
                        value={form?.promo_descripcion || ""}
                        onChange={e => setForm(f => ({ ...f!, promo_descripcion: e.target.value }))}
                        rows={3}
                        className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promo_descripcion ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none resize-none text-gray-900 font-medium`}
                        placeholder="Describe los detalles de la promoción..."
                      />
                      {errores.promo_descripcion && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.promo_descripcion}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Inicio promoción</label>
                        <DatePicker
                          selected={form?.promocion_inicio ? new Date(form.promocion_inicio) : null}
                          onChange={date => setForm(f => ({ ...f!, promocion_inicio: date ? date.toISOString() : "" }))}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="dd/MM/yyyy HH:mm"
                          minDate={new Date()}
                          maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                          className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promocion_inicio ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                          placeholderText="Selecciona fecha y hora"
                          calendarClassName="modern-calendar-custom"
                        />
                        {errores.promocion_inicio && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.promocion_inicio}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Fin promoción</label>
                        <DatePicker
                          selected={form?.promocion_fin ? new Date(form.promocion_fin) : null}
                          onChange={date => setForm(f => ({ ...f!, promocion_fin: date ? date.toISOString() : "" }))}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="dd/MM/yyyy HH:mm"
                          minDate={form?.promocion_inicio ? new Date(form.promocion_inicio) : new Date()}
                          maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                          className={`w-full px-4 py-3.5 bg-white border-2 ${errores.promocion_fin ? 'border-rose-500' : 'border-transparent'} rounded-xl focus:ring-4 focus:ring-blue-50 transition-all duration-200 outline-none text-gray-900 font-medium cursor-pointer`}
                          placeholderText="Selecciona fecha y hora"
                          calendarClassName="modern-calendar-custom"
                        />
                        {errores.promocion_fin && <p className="text-rose-300 text-sm mt-2 font-semibold">{errores.promocion_fin}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                className="px-8 py-4 bg-gradient-to-r from-[#0a1836] via-[#123361] to-[#1180B8] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
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
                  <h3 className="text-3xl font-black text-gray-900 mb-3">¡Vuelo editado!</h3>
                  <p className="text-gray-600 mb-8 text-lg">Los cambios han sido guardados exitosamente.</p>
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
    </>
  );
};

export default EditarVueloPage;