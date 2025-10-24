// src/hooks/useFlightSearch.ts
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchCiudades, type Ciudad } from '../services/flightServiceshome';

// Constantes de validación
const CAPITALES_NACIONALES = [
  "Arauca", "Armenia", "Barranquilla", "Bogotá", "Bucaramanga",
  "Cali", "Cartagena", "Cúcuta", "Florencia", "Ibagué",
  "Leticia", "Manizales", "Medellín", "Mitú", "Mocoa",
  "Montería", "Neiva", "Pasto", "Pereira", "Popayán",
  "Puerto Carreño", "Puerto Inírida", "Quibdó", "Riohacha",
  "San Andrés", "San José del Guaviare", "Santa Marta",
  "Sincelejo", "Tunja", "Valledupar", "Villavicencio", "Yopal"
];

const ORIGENES_INTERNACIONALES = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"];
const DESTINOS_INTERNACIONALES = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];

export const useFlightSearch = () => {
  const navigate = useNavigate();

  // Estados principales
  const [modo, setModo] = useState<"ida_vuelta" | "solo_ida">("ida_vuelta");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [ida, setIda] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState({ adultos: 1, menores: 0 });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de filtros adicionales
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [horarioIda, setHorarioIda] = useState<string[]>([]);
  const [horarioVuelta, setHorarioVuelta] = useState<string[]>([]);
  const [mostrarHorarios, setMostrarHorarios] = useState(false);

  // Estados de ciudades
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadesLoaded, setCiudadesLoaded] = useState(false);

  // Estados de validación
  const [camposInvalidos, setCamposInvalidos] = useState({
    origen: false,
    destino: false,
    ida: false,
    vuelta: false
  });

  // Estados de sugerencias
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<Ciudad[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<Ciudad[]>([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarPasajeros, setMostrarPasajeros] = useState(false);

  // Estados de bloqueo
  const [origenBloqueado, setOrigenBloqueado] = useState(false);
  const [destinoBloqueado, setDestinoBloqueado] = useState(false);

  // Ciudades seleccionadas
  const [ciudadOrigenSeleccionada, setCiudadOrigenSeleccionada] = useState<Ciudad | null>(null);
  const [ciudadDestinoSeleccionada, setCiudadDestinoSeleccionada] = useState<Ciudad | null>(null);

  // Refs
  const origenRef = useRef<HTMLDivElement>(null);
  const destinoRef = useRef<HTMLDivElement>(null);

  // Valores computados
  const totalPasajeros = pasajeros.adultos + pasajeros.menores;

  // ================== CARGAR CIUDADES ==================
  useEffect(() => {
    const cargarCiudades = async () => {
      try {
        setLoading(true);
        const data = await fetchCiudades();
        setCiudades(data);
        setCiudadesLoaded(true);
      } catch (error: any) {
        setMensaje(error.message || 'Error al cargar las ciudades. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    cargarCiudades();
  }, []);

  // ================== CLICK OUTSIDE ==================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (origenRef.current && !origenRef.current.contains(event.target as Node)) {
        setSugerenciasOrigen([]);
      }
      if (destinoRef.current && !destinoRef.current.contains(event.target as Node)) {
        setSugerenciasDestino([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ================== HELPERS ==================
  const normalize = (s: string) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  const limpiarCiudad = (valor: string) => valor.split("(")[0].trim();

  const limpiarErrorCampo = (campo: keyof typeof camposInvalidos) => {
    if (camposInvalidos[campo]) {
      setCamposInvalidos(prev => ({ ...prev, [campo]: false }));
    }
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ================== FILTROS DE PRECIO ==================
  const formatearPrecio = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    return numero ? Number(numero).toLocaleString('es-CO') : '';
  };

  const handlePrecioChange = (setter: (value: string) => void, valor: string) => {
    const numero = valor.replace(/\D/g, '');
    setter(numero);
  };

  const limpiarFiltrosPrecio = () => {
    setPrecioMin("");
    setPrecioMax("");
  };

  // ================== FILTROS DE HORARIO ==================
  const toggleHorario = (tipo: "ida" | "vuelta", franjaId: string) => {
    if (tipo === "ida") {
      setHorarioIda(prev => 
        prev.includes(franjaId) 
          ? prev.filter(h => h !== franjaId)
          : [...prev, franjaId]
      );
    } else {
      setHorarioVuelta(prev => 
        prev.includes(franjaId) 
          ? prev.filter(h => h !== franjaId)
          : [...prev, franjaId]
      );
    }
  };

  const limpiarFiltrosHorario = () => {
    setHorarioIda([]);
    setHorarioVuelta([]);
  };

  // ================== FILTROS ==================
  const filtrarOrigen = (valor: string) => {
    setOrigen(valor);
    if (camposInvalidos.origen) limpiarErrorCampo('origen');

    const q = normalize(valor);
    setSugerenciasOrigen(
      q ? ciudades.filter((c) => 
        normalize(c.nombre).includes(q) || normalize(c.codigo).includes(q)
      ) : []
    );
  };

  const filtrarDestino = (valor: string) => {
    setDestino(valor);
    if (camposInvalidos.destino) limpiarErrorCampo('destino');

    const q = normalize(valor);
    let listaPermitida: Ciudad[] = [];

    if (ciudadOrigenSeleccionada) {
      const origenNombre = ciudadOrigenSeleccionada.nombre;

      if (DESTINOS_INTERNACIONALES.includes(origenNombre)) {
        listaPermitida = ciudades.filter(c => 
          ORIGENES_INTERNACIONALES.includes(c.nombre)
        );
      } else if (ORIGENES_INTERNACIONALES.includes(origenNombre)) {
        const destinosNacionales = ciudades.filter(c => 
          CAPITALES_NACIONALES.includes(c.nombre) && 
          c.id_ciudad !== ciudadOrigenSeleccionada.id_ciudad
        );
        const destinosInternacionalesPermitidos = ciudades.filter(c => 
          DESTINOS_INTERNACIONALES.includes(c.nombre)
        );
        listaPermitida = [...destinosNacionales, ...destinosInternacionalesPermitidos];
      } else if (CAPITALES_NACIONALES.includes(origenNombre)) {
        listaPermitida = ciudades.filter(c => 
          CAPITALES_NACIONALES.includes(c.nombre) && 
          c.id_ciudad !== ciudadOrigenSeleccionada.id_ciudad
        );
      } else {
        listaPermitida = ciudades.filter(c => 
          c.id_ciudad !== ciudadOrigenSeleccionada.id_ciudad
        );
      }
    } else {
      listaPermitida = ciudades;
    }

    setSugerenciasDestino(
      q.length > 0 ? listaPermitida.filter((c) => 
        normalize(c.nombre).includes(q) || normalize(c.codigo).includes(q)
      ) : []
    );
  };

  // ================== SELECCIÓN DE CIUDADES ==================
  const seleccionarOrigen = (ciudad: Ciudad) => {
    setOrigen(`${ciudad.nombre} (${ciudad.codigo})`);
    setCiudadOrigenSeleccionada(ciudad);
    setOrigenBloqueado(true);
    setSugerenciasOrigen([]);

    if (ciudadDestinoSeleccionada?.id_ciudad === ciudad.id_ciudad) {
      setDestino("");
      setCiudadDestinoSeleccionada(null);
      setDestinoBloqueado(false);
    }
  };

  const seleccionarDestino = (ciudad: Ciudad) => {
    setDestino(`${ciudad.nombre} (${ciudad.codigo})`);
    setCiudadDestinoSeleccionada(ciudad);
    setDestinoBloqueado(true);
    setSugerenciasDestino([]);
  };

  const resetearOrigen = () => {
    setOrigen("");
    setCiudadOrigenSeleccionada(null);
    setOrigenBloqueado(false);
    setSugerenciasOrigen(ciudades);
    if (camposInvalidos.origen) limpiarErrorCampo('origen');
  };

  const resetearDestino = () => {
    setDestino("");
    setCiudadDestinoSeleccionada(null);
    setDestinoBloqueado(false);
    setSugerenciasDestino(ciudades);
    if (camposInvalidos.destino) limpiarErrorCampo('destino');
  };

  // ================== PASAJEROS ==================
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

  // ================== FECHAS ==================
  const actualizarFechas = ({ startDate, endDate }: { startDate: Date | null, endDate: Date | null }) => {
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
  };

  // ================== VALIDACIÓN ==================
  const validarYBuscarVuelo = () => {
    setCamposInvalidos({
      origen: false,
      destino: false,
      ida: false,
      vuelta: false
    });

    let hayErrores = false;
    const errores: any = {};

    if (!ciudadOrigenSeleccionada) {
      errores.origen = true;
      hayErrores = true;
    }

    if (!ciudadDestinoSeleccionada) {
      errores.destino = true;
      hayErrores = true;
    }

    if (!ida) {
      errores.ida = true;
      hayErrores = true;
    }

    if (modo === "ida_vuelta" && !vuelta) {
      errores.vuelta = true;
      hayErrores = true;
    }

    if (hayErrores) {
      setCamposInvalidos(errores);
      setMensaje("Por favor, completa los campos marcados en rojo.");
      return;
    }

    // Validación de precios
    if (precioMin && precioMax && Number(precioMin) > Number(precioMax)) {
      setMensaje("El precio mínimo no puede ser mayor que el máximo.");
      return;
    }

    const origenCiudad = limpiarCiudad(origen);
    const destinoCiudad = limpiarCiudad(destino);

    const origenEsCapitalNacional = CAPITALES_NACIONALES.includes(origenCiudad);
    const origenEsHubInternacional = ORIGENES_INTERNACIONALES.includes(origenCiudad);
    const origenEsInternacional = DESTINOS_INTERNACIONALES.includes(origenCiudad);
    const destinoEsCapitalNacional = CAPITALES_NACIONALES.includes(destinoCiudad);
    const destinoEsInternacional = DESTINOS_INTERNACIONALES.includes(destinoCiudad);
    const destinoEsHubInternacional = ORIGENES_INTERNACIONALES.includes(destinoCiudad);

    if (origenEsInternacional) {
      if (!destinoEsHubInternacional) {
        setMensaje("Desde ciudades internacionales solo puedes regresar a Pereira, Bogotá, Medellín, Cali o Cartagena.");
        return;
      }
    } else {
      if (!origenEsCapitalNacional) {
        setMensaje("Los vuelos solo pueden salir desde capitales principales del país.");
        return;
      }

      if (destinoEsInternacional && !origenEsHubInternacional) {
        setMensaje("Para vuelos internacionales, solo puedes salir desde Pereira, Bogotá, Medellín, Cali o Cartagena.");
        return;
      }

      if (!destinoEsInternacional && !destinoEsCapitalNacional) {
        setMensaje("Los vuelos nacionales solo pueden ir hacia otras capitales principales.");
        return;
      }
    }

    if (origenCiudad === destinoCiudad) {
      setMensaje("El origen y destino no pueden ser la misma ciudad.");
      return;
    }

    const searchParams = new URLSearchParams({
      originId: ciudadOrigenSeleccionada.id_ciudad.toString(),
      destinationId: ciudadDestinoSeleccionada.id_ciudad.toString(),
      departureDate: ida,
      roundTrip: (modo === "ida_vuelta").toString(),
      passengers: totalPasajeros.toString(),
      origen: ciudadOrigenSeleccionada.nombre,
      destino: ciudadDestinoSeleccionada.nombre,
    });

    if (modo === "ida_vuelta" && vuelta) {
      searchParams.append('returnDate', vuelta);
    }

    // Agregar filtros de precio si están definidos
    if (precioMin) {
      searchParams.append('precioMin', precioMin);
    }
    if (precioMax) {
      searchParams.append('precioMax', precioMax);
    }

    // Agregar filtros de horario si están seleccionados
    if (horarioIda.length > 0) {
      searchParams.append('horarioIda', horarioIda.join(','));
    }
    if (modo === "ida_vuelta" && horarioVuelta.length > 0) {
      searchParams.append('horarioVuelta', horarioVuelta.join(','));
    }

    navigate(`/buscar-vuelos?${searchParams.toString()}`);
  };

  return {
    // Estados
    modo,
    origen,
    destino,
    ida,
    vuelta,
    pasajeros,
    mensaje,
    loading,
    ciudades,
    ciudadesLoaded,
    camposInvalidos,
    sugerenciasOrigen,
    sugerenciasDestino,
    mostrarCalendario,
    mostrarPasajeros,
    origenBloqueado,
    destinoBloqueado,
    ciudadOrigenSeleccionada,
    ciudadDestinoSeleccionada,
    totalPasajeros,
    
    // Estados de filtros adicionales
    precioMin,
    precioMax,
    horarioIda,
    horarioVuelta,
    mostrarHorarios,
    
    // Refs
    origenRef,
    destinoRef,
    
    // Setters
    setModo,
    setMostrarCalendario,
    setMostrarPasajeros,
    setPrecioMin,
    setPrecioMax,
    setHorarioIda,
    setHorarioVuelta,
    setMostrarHorarios,
    
    // Funciones
    filtrarOrigen,
    filtrarDestino,
    seleccionarOrigen,
    seleccionarDestino,
    resetearOrigen,
    resetearDestino,
    cambiarPasajeros,
    actualizarFechas,
    validarYBuscarVuelo,
    limpiarErrorCampo,
    formatearPrecio,
    handlePrecioChange,
    toggleHorario,
    limpiarFiltrosHorario,
    limpiarFiltrosPrecio,
  };
};