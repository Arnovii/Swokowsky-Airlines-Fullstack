import { useState, useEffect } from "react";
import { getAeropuertos } from "../services/flights";

// Constantes de validación basadas en ciudades (igual que en useFlightSearch)
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

// Tipo para aeropuerto (según la estructura del sistema)
export interface Aeropuerto {
  id_aeropuerto: number;
  nombre: string;
  codigo_iata: string;
  ciudad: {
    id_ciudad: number;
    nombre: string;
  };
}

export const useAeropuertoValidation = () => {
  // Estados principales
  const [aeropuertos, setAeropuertos] = useState<Aeropuerto[]>([]);
  const [aeropuertosLoaded, setAeropuertosLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de selección
  const [aeropuertoOrigenSeleccionado, setAeropuertoOrigenSeleccionado] = useState<Aeropuerto | null>(null);
  const [aeropuertoDestinoSeleccionado, setAeropuertoDestinoSeleccionado] = useState<Aeropuerto | null>(null);

  // Estados de sugerencias
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<Aeropuerto[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<Aeropuerto[]>([]);

  // ================== CARGAR AEROPUERTOS ==================
  useEffect(() => {
    const cargarAeropuertos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAeropuertos();
        setAeropuertos(data);
        setAeropuertosLoaded(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar los aeropuertos.');
      } finally {
        setLoading(false);
      }
    };

    cargarAeropuertos();
  }, []);

  // ================== HELPERS ==================
  const normalize = (s: string) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  // ================== FILTROS ==================
  const filtrarAeropuertosOrigen = (valor: string) => {
    const q = normalize(valor);
    setSugerenciasOrigen(
      q ? aeropuertos.filter((a) => 
        normalize(a.nombre).includes(q) || 
        normalize(a.codigo_iata).includes(q) ||
        normalize(a.ciudad.nombre).includes(q)
      ) : []
    );
  };

  const filtrarAeropuertosDestino = (valor: string) => {
    const q = normalize(valor);
    let listaPermitida: Aeropuerto[] = [];

    if (aeropuertoOrigenSeleccionado) {
      const origenCiudad = aeropuertoOrigenSeleccionado.ciudad.nombre;

      // Aplicar las mismas reglas que en useFlightSearch
      if (DESTINOS_INTERNACIONALES.includes(origenCiudad)) {
        // Desde ciudades internacionales solo a hubs nacionales
        listaPermitida = aeropuertos.filter(a => 
          ORIGENES_INTERNACIONALES.includes(a.ciudad.nombre)
        );
      } else if (ORIGENES_INTERNACIONALES.includes(origenCiudad)) {
        // Desde hubs internacionales a capitales nacionales + destinos internacionales
        const destinosNacionales = aeropuertos.filter(a => 
          CAPITALES_NACIONALES.includes(a.ciudad.nombre) && 
          a.id_aeropuerto !== aeropuertoOrigenSeleccionado.id_aeropuerto
        );
        const destinosInternacionalesPermitidos = aeropuertos.filter(a => 
          DESTINOS_INTERNACIONALES.includes(a.ciudad.nombre)
        );
        listaPermitida = [...destinosNacionales, ...destinosInternacionalesPermitidos];
      } else if (CAPITALES_NACIONALES.includes(origenCiudad)) {
        // Desde capitales nacionales solo a otras capitales nacionales
        listaPermitida = aeropuertos.filter(a => 
          CAPITALES_NACIONALES.includes(a.ciudad.nombre) && 
          a.id_aeropuerto !== aeropuertoOrigenSeleccionado.id_aeropuerto
        );
      } else {
        // Desde otras ciudades a cualquier lugar excepto el mismo aeropuerto
        listaPermitida = aeropuertos.filter(a => 
          a.id_aeropuerto !== aeropuertoOrigenSeleccionado.id_aeropuerto
        );
      }
    } else {
      listaPermitida = aeropuertos;
    }

    setSugerenciasDestino(
      q.length > 0 ? listaPermitida.filter((a) => 
        normalize(a.nombre).includes(q) || 
        normalize(a.codigo_iata).includes(q) ||
        normalize(a.ciudad.nombre).includes(q)
      ) : []
    );
  };

  // ================== SELECCIÓN ==================
  const seleccionarAeropuertoOrigen = (aeropuerto: Aeropuerto) => {
    setAeropuertoOrigenSeleccionado(aeropuerto);
    setSugerenciasOrigen([]);

    // Si el destino es el mismo aeropuerto, limpiarlo
    if (aeropuertoDestinoSeleccionado?.id_aeropuerto === aeropuerto.id_aeropuerto) {
      setAeropuertoDestinoSeleccionado(null);
    }
  };

  const seleccionarAeropuertoDestino = (aeropuerto: Aeropuerto) => {
    setAeropuertoDestinoSeleccionado(aeropuerto);
    setSugerenciasDestino([]);
  };

  const resetearOrigen = () => {
    setAeropuertoOrigenSeleccionado(null);
    setSugerenciasOrigen([]);
  };

  const resetearDestino = () => {
    setAeropuertoDestinoSeleccionado(null);
    setSugerenciasDestino([]);
  };

  // ================== VALIDACIÓN ==================
  const validarAeropuertos = () => {
    if (!aeropuertoOrigenSeleccionado) {
      setError("Debes seleccionar un aeropuerto de origen.");
      return false;
    }

    if (!aeropuertoDestinoSeleccionado) {
      setError("Debes seleccionar un aeropuerto de destino.");
      return false;
    }

    const origenCiudad = aeropuertoOrigenSeleccionado.ciudad.nombre;
    const destinoCiudad = aeropuertoDestinoSeleccionado.ciudad.nombre;

    const origenEsCapitalNacional = CAPITALES_NACIONALES.includes(origenCiudad);
    const origenEsHubInternacional = ORIGENES_INTERNACIONALES.includes(origenCiudad);
    const origenEsInternacional = DESTINOS_INTERNACIONALES.includes(origenCiudad);
    const destinoEsCapitalNacional = CAPITALES_NACIONALES.includes(destinoCiudad);
    const destinoEsInternacional = DESTINOS_INTERNACIONALES.includes(destinoCiudad);
    const destinoEsHubInternacional = ORIGENES_INTERNACIONALES.includes(destinoCiudad);

    // Validaciones específicas
    if (origenEsInternacional) {
      if (!destinoEsHubInternacional) {
        setError("Desde ciudades internacionales solo puedes programar vuelos hacia Pereira, Bogotá, Medellín, Cali o Cartagena.");
        return false;
      }
    } else {
      if (!origenEsCapitalNacional) {
        setError("Los vuelos solo pueden salir desde aeropuertos en capitales principales del país.");
        return false;
      }

      if (destinoEsInternacional && !origenEsHubInternacional) {
        setError("Para vuelos internacionales, solo puedes salir desde aeropuertos en Pereira, Bogotá, Medellín, Cali o Cartagena.");
        return false;
      }

      if (!destinoEsInternacional && !destinoEsCapitalNacional) {
        setError("Los vuelos nacionales solo pueden ir hacia aeropuertos en otras capitales principales.");
        return false;
      }
    }

    if (aeropuertoOrigenSeleccionado.id_aeropuerto === aeropuertoDestinoSeleccionado.id_aeropuerto) {
      setError("El aeropuerto de origen y destino no pueden ser el mismo.");
      return false;
    }

    setError(null);
    return true;
  };

  return {
    // Estados
    aeropuertos,
    aeropuertosLoaded,
    loading,
    error,
    aeropuertoOrigenSeleccionado,
    aeropuertoDestinoSeleccionado,
    sugerenciasOrigen,
    sugerenciasDestino,
    
    // Funciones
    filtrarAeropuertosOrigen,
    filtrarAeropuertosDestino,
    seleccionarAeropuertoOrigen,
    seleccionarAeropuertoDestino,
    resetearOrigen,
    resetearDestino,
    validarAeropuertos,
    setError,
  };
};