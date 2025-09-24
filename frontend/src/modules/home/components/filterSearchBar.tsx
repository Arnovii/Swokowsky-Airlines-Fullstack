import { useState, useEffect, useRef } from "react";
import { PlaneTakeoff, PlaneLanding } from "lucide-react";
import CalendarioRango from "@/modules/home/components/CalendarioRango";
import { useNavigate } from 'react-router-dom';

const PlaneDepartureIcon = () => (
  <svg
    className="w-6 h-6 text-[#0e254d]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 18.5A2.5 2.5 0 0 1 7.5 20a2.5 2.5 0 0 1-2.5 2.5M12 18.5A2.5 2.5 0 0 0 16.5 20a2.5 2.5 0 0 0 2.5 2.5M8 12h8m-8 3h8m-8-6h8M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
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

const CalendarIcon = () => (
  <svg
    className="w-6 h-6 text-[#0e254d]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-6 h-6 text-[#0e254d]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="w-5 h-5 text-[#0e254d]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5 text-[#0e254d]"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14m-7 7V5"
    />
  </svg>
);




export default function BuscadorVuelosModerno() {
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Navigate en useEffect:", navigate);
  }, [navigate]);
  const [modo, setModo] = useState("ida_vuelta");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [ida, setIda] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState({ adultos: 1, menores: 0 });
  const [mostrarPasajeros, setMostrarPasajeros] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
  
  // AGREGAR ESTE NUEVO ESTADO
  const [camposInvalidos, setCamposInvalidos] = useState({
    origen: false,
    destino: false,
    ida: false,
    vuelta: false
  });

  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const origenRef = useRef(null);
  const destinoRef = useRef(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [origenBloqueado, setOrigenBloqueado] = useState(false);
  const [destinoBloqueado, setDestinoBloqueado] = useState(false);
  

 
  const ciudades = [

  { ciudad: "Bogotá", pais: "Colombia", codigo: "BOG" },
  { ciudad: "Medellín", pais: "Colombia", codigo: "MDE" },
  { ciudad: "Cali", pais: "Colombia", codigo: "CLO" },
  { ciudad: "Barranquilla", pais: "Colombia", codigo: "BAQ" },
  { ciudad: "Cartagena", pais: "Colombia", codigo: "CTG" },
  { ciudad: "Bucaramanga", pais: "Colombia", codigo: "BGA" },
  { ciudad: "Pereira", pais: "Colombia", codigo: "PEI" },
  { ciudad: "Manizales", pais: "Colombia", codigo: "MZL" },
  { ciudad: "Santa Marta", pais: "Colombia", codigo: "SMR" },
  { ciudad: "Cúcuta", pais: "Colombia", codigo: "CUC" },
  { ciudad: "Ibagué", pais: "Colombia", codigo: "IBE" },
  { ciudad: "Villavicencio", pais: "Colombia", codigo: "VVC" },
  { ciudad: "Armenia", pais: "Colombia", codigo: "AXM" },
  { ciudad: "Montería", pais: "Colombia", codigo: "MTR" },
  { ciudad: "Neiva", pais: "Colombia", codigo: "NVA" },
  { ciudad: "Pasto", pais: "Colombia", codigo: "PSO" },
  { ciudad: "Sincelejo", pais: "Colombia", codigo: "CZU" },
  { ciudad: "Riohacha", pais: "Colombia", codigo: "RCH" },
  { ciudad: "Valledupar", pais: "Colombia", codigo: "VUP" },
  { ciudad: "Popayán", pais: "Colombia", codigo: "PPN" },
  { ciudad: "Tunja", pais: "Colombia", codigo: "TUN" },
  { ciudad: "Florencia", pais: "Colombia", codigo: "FLA" },
  { ciudad: "Yopal", pais: "Colombia", codigo: "EYP" },
  { ciudad: "Mocoa", pais: "Colombia", codigo: "VGZ" },
  { ciudad: "San Andrés", pais: "Colombia", codigo: "ADZ" },
  { ciudad: "Mitú", pais: "Colombia", codigo: "MVP" },
  { ciudad: "Puerto Carreño", pais: "Colombia", codigo: "PCR" },
  { ciudad: "Inírida", pais: "Colombia", codigo: "LCR" },
  { ciudad: "Quibdó", pais: "Colombia", codigo: "UIB" },
  { ciudad: "Leticia", pais: "Colombia", codigo: "LET" },

  { ciudad: "Madrid", pais: "Spain", codigo: "MAD" },
  { ciudad: "Londres", pais: "United Kingdom", codigo: "LHR" },
  { ciudad: "New York", pais: "United States", codigo: "JFK" },
  { ciudad: "Buenos Aires", pais: "Argentina", codigo: "EZE" },
  { ciudad: "Miami", pais: "United States", codigo: "MIA" }
];


  const ciudadesColombia = ciudades.filter(c => c.pais === "Colombia").map(c => c.ciudad);
  const origenesInternacionales = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"];
  const destinosInternacionales = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];
  
  const hoy = new Date().toISOString().split("T")[0];
  const unAñoDespues = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const totalPasajeros = pasajeros.adultos + pasajeros.menores;

  // ================== HELPERS ==================
  const normalize = (s: string) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  const limpiarCiudad = (valor: string) => valor.split("(")[0].trim();

  const cambiarPasajeros = (tipo: "adultos" | "menores", operacion: "sumar" | "restar") => {
    setPasajeros(prev => {
      let nuevoValor = operacion === "sumar" ? prev[tipo] + 1 : prev[tipo] - 1;
      nuevoValor = Math.max(0, nuevoValor);

      const nuevosPasajeros = { ...prev, [tipo]: nuevoValor };
      const total = nuevosPasajeros.adultos + nuevosPasajeros.menores;

      if (total > 5) return prev;
      if (nuevosPasajeros.adultos === 0) return { ...prev, adultos: 1 };

      return nuevosPasajeros;
    });
  };

  // AGREGAR ESTA NUEVA FUNCIÓN
  const limpiarErrorCampo = (campo) => {
    if (camposInvalidos[campo]) {
      setCamposInvalidos(prev => ({
        ...prev,
        [campo]: false
      }));
    }
  };

  // ================== FILTROS ==================
const filtrarOrigen = (valor: string) => {
    setOrigen(valor);
    if (errors.origen) setErrors(prev => ({ ...prev, origen: false })); // Limpia el error
    // AGREGAR ESTA LÍNEA
    if (camposInvalidos.origen) limpiarErrorCampo('origen');
    const q = normalize(valor);
    setSugerenciasOrigen(q ? ciudades.filter((c) => normalize(c.ciudad).includes(q)) : []);
  };

const filtrarDestino = (valor: string) => {
  setDestino(valor);
  if (errors.destino) setErrors(prev => ({ ...prev, destino: false }));
  // AGREGAR ESTA LÍNEA
  if (camposInvalidos.destino) limpiarErrorCampo('destino');
  const q = normalize(valor);
  let listaPermitida: typeof ciudades = [];

  if (origen) {
    const origenCiudad = limpiarCiudad(origen);

    // Verificamos si el origen es una ciudad colombiana válida
    const origenEsValido = ciudades.some(
      (c) => c.ciudad === origenCiudad && c.pais === "Colombia"
    );

    if (origenEsValido) {
      // Permitimos todos los destinos nacionales EXCEPTO el mismo origen
      listaPermitida = ciudades.filter(
        (c) => c.pais === "Colombia" && c.ciudad !== origenCiudad
      );

      // Si ese origen es un hub internacional...
      if (origenesInternacionales.includes(origenCiudad)) {
        const destinosInternacionalesPermitidos = ciudades.filter((c) =>
          destinosInternacionales.includes(c.ciudad)
        );
        listaPermitida.push(...destinosInternacionalesPermitidos);
      }
    }
  } else {
    // Si no hay origen, mostramos todas las ciudades (sin restricción)
    listaPermitida = ciudades;
  }

  // Aplicar filtro por lo que escribe el usuario
  setSugerenciasDestino( q.length > 0 ? listaPermitida.filter((c) => normalize(c.ciudad).includes(q)) : []);
};

  // ================== EFFECTS ==================
  const handleChange = (item) => {
  if (modo === "solo_ida") {
    const startDate = item;
    onChange({ startDate, endDate: null });
    setRange([{ startDate, endDate: null, key: "selection" }]);
  } else {
    const { startDate, endDate } = item.selection;
    onChange({ startDate, endDate });
    setRange([{ startDate, endDate, key: "selection" }]);
  }
};

  // AGREGAR ESTA NUEVA FUNCIÓN
  const validarYBuscarVuelo = () => {
    // Resetear errores previos
    setCamposInvalidos({
      origen: false,
      destino: false,
      ida: false,
      vuelta: false
    });

    let hayErrores = false;
    const errores = {};

    // Validar origen
    if (!origen.trim()) {
      errores.origen = true;
      hayErrores = true;
    }

    // Validar destino
    if (!destino.trim()) {
      errores.destino = true;
      hayErrores = true;
    }

    // Validar fecha de ida
    if (!ida) {
      errores.ida = true;
      hayErrores = true;
    }

    // Validar fecha de vuelta solo si es ida y vuelta
    if (modo === "ida_vuelta" && !vuelta) {
      errores.vuelta = true;
      hayErrores = true;
    }

    // Si hay errores, mostrarlos y no continuar
    if (hayErrores) {
      setCamposInvalidos(errores);
      return;
    }

    // Si no hay errores, llamar a la función original de validación
    validarVuelo();
  };

  // ================== VALIDACIÓN ==================
  const validarVuelo = () => {
    setMensaje("");
    const newErrors: { [key: string]: boolean } = {};

    // 1. Revisar campos obligatorios
    if (!origen) newErrors.origen = true;
    if (!destino) newErrors.destino = true;
    if (!ida) newErrors.ida = true;
    if (modo === "ida_vuelta" && !vuelta) newErrors.vuelta = true;

    // 2. Si hay errores, mostrarlos y detenerse
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMensaje("Por favor, completa los campos marcados en rojo.");
      return;
    }

    // 3. Si no hay errores, limpiar y proceder con la lógica existente
    setErrors({});
    const origenCiudad = limpiarCiudad(origen);
    const destinoCiudad = limpiarCiudad(destino);
    const origenEsInt = origenesInternacionales.includes(origenCiudad);
    const destinoEsInt = destinosInternacionales.includes(destinoCiudad);

    if (destinoEsInt && !origenEsInt) {
      return setMensaje("Solo puedes salir internacionalmente desde aeropuertos autorizados.");
    }

    // Si todo está válido, navegar a resultados
    const searchParams = new URLSearchParams({
      origen: origenCiudad,
      destino: destinoCiudad,
      fecha: ida,
      ...(modo === "ida_vuelta" && vuelta && { fechaVuelta: vuelta }),
      pasajeros: totalPasajeros.toString(),
      adultos: pasajeros.adultos.toString(),
      menores: pasajeros.menores.toString(),
      modo
    });

    setTimeout(() => {
      try {
        navigate(`/buscar-vuelos?${searchParams.toString()}`);
        setMensaje("✅ Búsqueda válida. Redirigiendo...");
      } catch (error) {
        console.error("Error al navegar:", error);
        // Fallback a window.location
        window.location.href = `/buscar-vuelos?${searchParams.toString()}`;
      }
    }, 0);
  };
  

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthPadded = String(month).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');
    return `${year}-${monthPadded}-${dayPadded}`;
  };

  return (
    <div className="sticky top-[80px] z-40 w-full max-w-6xl mx-auto px-6 font-sans">
      <div className="relative rounded-3xl shadow-2xl border border-white/50">
        <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-3xl"></div>

        <div className="relative z-10 p-2">
          {/* Tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setModo("ida_vuelta")}
              className={`px-5 py-2.5 text-base font-sans rounded-full transition-colors ${
                modo === "ida_vuelta"
                  ? "bg-[#0e254d] text-white shadow-lg"
                  : "text-gray-600 hover:bg-[#0e254d]"
              }`}
            >
              Ida y vuelta
            </button>
            <button
              onClick={() => setModo("solo_ida")}
              className={`px-5 py-2.5 text-base font-sans rounded-full transition-colors ${
                modo === "solo_ida"
                  ? "bg-[#0e254d] text-white shadow-lg"
                  : "text-gray-600 hover:bg-[#0e254d]"
              }`}
            >
              Solo ida
            </button>
          </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.5fr_1fr_0.8fr] gap-4 items-end text-lg">
          {/* Origen */}
          <div className="flex flex-col relative" ref={origenRef}>
            <label className="text-sm text-gray-600 mb-2">Origen</label>
            <div className={`flex items-center gap-3 border ${camposInvalidos.origen ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-3 shadow-sm h-14`}>
              <PlaneTakeoff className="w-5 h-5 text-[#0e254d]" />
              <input
                type="text"
                placeholder="Bogotá"
                value={origen}
                onChange={(e) => {
                  if (!origenBloqueado) {
                    filtrarOrigen(e.target.value);
                    if (camposInvalidos.origen) limpiarErrorCampo('origen');
                  }
                }}
                readOnly={origenBloqueado}
                onClick={() => {
                  if (origenBloqueado) {
                    // Si está bloqueado y haces click → limpiar
                    setOrigen("");
                    setOrigenBloqueado(false);
                    setSugerenciasOrigen(ciudades);
                  }
                  if (camposInvalidos.origen) limpiarErrorCampo('origen');
                }}
                className={`w-full bg-transparent outline-none text-base font-sans text-gray-900 ${origenBloqueado ? "cursor-pointer" : ""}`}
              />
            </div>
            {sugerenciasOrigen.length > 0 && (
              <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {sugerenciasOrigen.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setOrigen(`${c.ciudad} (${c.codigo})`);
                      setOrigenBloqueado(true); 
                      setSugerenciasOrigen([]);
                    }}
                    className="flex justify-between p-3 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    <div>
                      <span className="font-sans text-gray-900">{c.ciudad}</span>{" "}
                      <span className="text-gray-500">({c.pais})</span>
                    </div>
                    <span className="font-sans text-gray-700">{c.codigo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Destino */}
          <div className="flex flex-col relative" ref={destinoRef}>
            <label className="text-sm text-gray-600 mb-2">Destino</label>
            <div className={`flex items-center gap-3 border ${camposInvalidos.destino ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-3 shadow-sm h-14`}>
              <PlaneLanding className="w-5 h-5 text-[#0e254d]" />
              <input
                type="text"
                placeholder="Madrid"
                value={destino}
                onChange={(e) => {
                  if (!destinoBloqueado) {
                    filtrarDestino(e.target.value);
                    if (camposInvalidos.destino) limpiarErrorCampo('destino');
                  }
                }}
                readOnly={destinoBloqueado}
                onClick={() => {
                  if (destinoBloqueado) {
                    setDestino("");
                    setDestinoBloqueado(false);
                    setSugerenciasDestino(ciudades);
                  }
                  if (camposInvalidos.destino) limpiarErrorCampo('destino');
                }}
                className={`w-full bg-transparent outline-none text-base font-sans text-gray-900 ${
                  destinoBloqueado ? "cursor-pointer" : ""
                }`}
              />
            </div>
            {sugerenciasDestino.length > 0 && (
              <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {sugerenciasDestino.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setDestino(`${c.ciudad} (${c.codigo})`);
                      setDestinoBloqueado(true);
                      setSugerenciasDestino([]);
                    }}
                    className="flex justify-between p-3 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    <div>
                      <span className="font-sans text-gray-900">{c.ciudad}</span>{" "}
                      <span className="text-gray-500">({c.pais})</span>
                    </div>
                    <span className="font-sans text-gray-700">{c.codigo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fechas */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Fechas</label>
            <div className="flex gap-2 overflow-hidden">
              {/* Fecha Ida */}
              <div 
                className={`flex-1 border ${camposInvalidos.ida ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-2 sm:p-3 cursor-pointer shadow-sm h-14 flex items-center gap-2 min-w-0`}
                onClick={() => {
                  setMostrarCalendario(true);
                  if (camposInvalidos.ida) limpiarErrorCampo('ida');
                  if (camposInvalidos.vuelta) limpiarErrorCampo('vuelta');
                }}
              >
                <CalendarIcon />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Ida</div>
                  <div className="text-xs sm:text-sm font-sans text-gray-900 truncate">
                    {ida ? new Date(`${ida}T00:00:00`).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    }) : "Seleccionar"}
                  </div>
                </div>
              </div>

              {/* Fecha Vuelta */}
              {modo === "ida_vuelta" && (
                <div 
                  className={`flex-1 border ${camposInvalidos.vuelta ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-2 sm:p-3 cursor-pointer shadow-sm h-14 flex items-center gap-2 min-w-0`}
                  onClick={() => {
                    setMostrarCalendario(true);
                    if (camposInvalidos.ida) limpiarErrorCampo('ida');
                    if (camposInvalidos.vuelta) limpiarErrorCampo('vuelta');
                  }}
                >
                  <CalendarIcon />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Vuelta</div>
                    <div className="text-xs sm:text-sm font-sans text-gray-900 truncate">
                      {vuelta ? new Date(`${vuelta}T00:00:00`).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      }) : "Seleccionar"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Componente CalendarioRango */}
            <CalendarioRango
              modo={modo}
              isOpen={mostrarCalendario}
              onOpenChange={setMostrarCalendario}
              fechaInicial={ida}
              fechaFinal={vuelta}
              onChange={({ startDate, endDate }) => {
        
                if (startDate) {
                  setIda(formatDateToYYYYMMDD(startDate));
                  if (camposInvalidos.ida) limpiarErrorCampo('ida');
                }
                if (endDate && modo === "ida_vuelta") {
                  setVuelta(formatDateToYYYYMMDD(endDate));
                  if (camposInvalidos.vuelta) limpiarErrorCampo('vuelta');
                } else {
                  setVuelta("");
                }
              }}
            />
          </div>

          {/* Pasajeros  */}
          <div className="relative">
            <label className="text-sm text-gray-600 mb-2">Pasajeros</label>
            <div
              onClick={() => setMostrarPasajeros(!mostrarPasajeros)}
              className="flex items-center justify-between border border-gray-300 bg-white rounded-xl p-3 cursor-pointer shadow-sm h-14"
            >
              <UserIcon />
              <span className="text-base font-sans text-gray-900">
                {totalPasajeros}
              </span>
              <ChevronDownIcon
                className={`transition-transform ${mostrarPasajeros ? "rotate-180" : ""}`}
              />
            </div>
            {mostrarPasajeros && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[200px]">
                <div className="space-y-4">
                  <div className="text-base font-sans text-gray-900">
                    ¿Quiénes viajan?
                  </div>
                  {/* Adultos */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-sans text-gray-900">Adultos</div>
                      <div className="text-xs text-gray-500">Mayores de 18 años</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarPasajeros("adultos", "restar");
                        }}
                        disabled={pasajeros.adultos <= 1}
                        className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-5 text-center font-sans text-[#0e254d] text-sm">
                        {pasajeros.adultos}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarPasajeros("adultos", "sumar");
                        }}
                        disabled={totalPasajeros >= 5}
                        className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>

                  {/* Menores */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-sans text-gray-900">Menores</div>
                      <div className="text-xs text-gray-500">De 0 a 17 años</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarPasajeros("menores", "restar");
                        }}
                        disabled={pasajeros.menores <= 0}
                        className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-5 text-center font-sans text-[#0e254d] text-sm">
                        {pasajeros.menores}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cambiarPasajeros("menores", "sumar");
                        }}
                        disabled={totalPasajeros >= 5}
                        className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>

                  {totalPasajeros >= 5 && (
                    <div className="text-xs text-[#0e254d] bg-blue-50 p-2 rounded-lg text-center">
                      Máximo 5 personas
                    </div>
                  )}

                  <button
                    onClick={() => setMostrarPasajeros(false)}
                    className="w-full mt-2 py-2 bg-[#0e254d] text-white rounded-lg text-sm font-sans hover:bg-[#0a1a3a] transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end h-full">
            <button
              onClick={validarYBuscarVuelo}
              className="w-full h-14 flex items-center justify-center bg-[#0e254d] text-white font-sans rounded-xl shadow-lg hover:bg-[#0a1a3a] transition-colors text-base font-medium"
            >
              Buscar
            </button>
          </div>
        </div>
                  {/* Mensaje */}
          {mensaje && (
            <div className="mt-8 p-5 text-center font-sans text-base text-gray-800 bg-[#0e254d] rounded-xl border border-[#0e254d]">
              {mensaje}
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  );
}