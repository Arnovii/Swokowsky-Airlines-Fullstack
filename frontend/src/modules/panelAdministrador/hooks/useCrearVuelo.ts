import { useState, useEffect } from "react";
import { getAeropuertos, getAeronaves, crearVuelo } from "../services/flights";
import type { CrearVueloPayload, Aeropuerto, Aeronave } from "../pages/CrearVueloPage";

export interface UseCrearVueloResult {
  aeropuertos: Aeropuerto[];
  aeronaves: Aeronave[];
  form: CrearVueloPayload;
  setForm: React.Dispatch<React.SetStateAction<CrearVueloPayload>>;
  salidaDate: Date | null;
  setSalidaDate: (date: Date | null) => void;
  llegadaDate: Date | null;
  setLlegadaDate: (date: Date | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
  loading: boolean;
  handleTarifaChange: (clase: string, precio: number) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent, navigate: (url: string) => void, setShowConfirm: (v: boolean) => void, setSuccess: (msg: string) => void) => Promise<void>;
}

export function useCrearVuelo(): UseCrearVueloResult {
  const [aeropuertos, setAeropuertos] = useState<Aeropuerto[]>([]);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [form, setForm] = useState<CrearVueloPayload>({
    id_aeronaveFK: 0,
    id_aeropuerto_origenFK: 0,
    id_aeropuerto_destinoFK: 0,
    salida_programada_utc: "",
    llegada_programada_utc: "",
    estado: "Programado",
    tarifa: [
      { clase: "economica", precio_base: 0 },
      { clase: "primera_clase", precio_base: 0 },
    ],
    promocion: false,
    descuento: 0,
    promocion_inicio: "",
    promocion_fin: "",
  });
  const [salidaDate, setSalidaDate] = useState<Date | null>(null);
  const [llegadaDate, setLlegadaDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAeropuertos()
      .then((data) => setAeropuertos(data as Aeropuerto[]))
      .catch(() => setError("Error al cargar aeropuertos"));
    getAeronaves()
      .then((data) => setAeronaves(data as Aeronave[]))
      .catch(() => setError("Error al cargar aeronaves"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Convertir a número si es un campo de id
    const numericFields = ["id_aeronaveFK", "id_aeropuerto_origenFK", "id_aeropuerto_destinoFK"];
    setForm((prev: CrearVueloPayload) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const handleTarifaChange = (clase: string, precio: number) => {
    setForm((prev: CrearVueloPayload) => ({
      ...prev,
      tarifa: prev.tarifa.map((t: { clase: string; precio_base: number }) =>
        t.clase === clase ? { ...t, precio_base: precio } : t
      ),
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    navigate: (url: string) => void,
    setShowConfirm: (v: boolean) => void,
    setSuccess: (msg: string) => void
  ) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    // Validaciones
    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 1);
    if (
      !form.id_aeronaveFK ||
      !form.id_aeropuerto_origenFK ||
      !form.id_aeropuerto_destinoFK ||
      !salidaDate ||
      !llegadaDate ||
      form.tarifa.some((t: { clase: string; precio_base: number }) => t.precio_base <= 0)
    ) {
      setError("Todos los campos son obligatorios y los precios deben ser mayores a 0.");
      setLoading(false);
      return;
    }
    // No permitir que origen y destino sean el mismo aeropuerto
    if (form.id_aeropuerto_origenFK === form.id_aeropuerto_destinoFK) {
      setError("El aeropuerto de origen y destino no pueden ser el mismo.");
      setLoading(false);
      return;
    }
    // Validaciones de vuelos internacionales
    const capitalesNacionales = [
      "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales", "Armenia", "Santa Marta", "Cúcuta", "Ibagué", "Villavicencio", "Pasto", "Montería", "Neiva", "Popayán", "Sincelejo", "Riohacha", "Quibdó", "Tunja", "Florencia", "Yopal", "Mocoa", "San Andrés", "Leticia", "Mitú", "Puerto Carreño", "Inírida", "San José del Guaviare"
    ];
    const origenInternacional = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"];
    const destinoInternacional = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];
    const origen = aeropuertos.find(a => a.id_aeropuerto === form.id_aeropuerto_origenFK)?.nombre;
    const destino = aeropuertos.find(a => a.id_aeropuerto === form.id_aeropuerto_destinoFK)?.nombre;
    if (destinoInternacional.includes(destino || "")) {
      if (!origenInternacional.includes(origen || "")) {
        setError("Para vuelos internacionales, el origen debe ser: Pereira, Bogotá, Medellín, Cali o Cartagena.");
        setLoading(false);
        return;
      }
    } else {
      if (origenInternacional.includes(origen || "") && destinoInternacional.includes(destino || "")) {
        setError("No se permite crear vuelos internacionales con destino nacional desde los orígenes internacionales.");
        setLoading(false);
        return;
      }
    }
    if (salidaDate < now || salidaDate > maxDate) {
      setError("La fecha de salida debe ser desde hoy y máximo hasta 1 año.");
      setLoading(false);
      return;
    }
    if (llegadaDate < salidaDate || llegadaDate > maxDate) {
      setError("La fecha de llegada debe ser después de la salida y máximo hasta 1 año.");
      setLoading(false);
      return;
    }
    // Construir el payload para /api/v1/news
    const payload = {
      titulo: form.titulo || "Nuevo vuelo", // Puedes ajustar el origen del título
      descripcion_corta: form.descripcion_corta || "Vuelo creado desde el panel", // Ajusta según tu formulario
      descripcion_larga: form.descripcion_larga || "Detalles del vuelo", // Ajusta según tu formulario
      url_imagen: form.url_imagen || "", // Ajusta según tu formulario
      precio_economica: form.tarifa[0]?.precio_base || 0,
      precio_primera_clase: form.tarifa[1]?.precio_base || 0,
      promocion: form.promocion ? {
        nombre: form.promo_nombre || "",
        descripcion: form.promo_descripcion || "",
        descuento: form.descuento ? Number(form.descuento) / 100 : 0,
        fecha_inicio: form.promocion_inicio || "",
        fecha_fin: form.promocion_fin || ""
      } : undefined,
      salida_colombia: salidaDate ? salidaDate.toISOString() : "",
      llegada_colombia: llegadaDate ? llegadaDate.toISOString() : "",
      id_aeronaveFK: form.id_aeronaveFK,
      id_aeropuerto_origenFK: form.id_aeropuerto_origenFK,
      id_aeropuerto_destinoFK: form.id_aeropuerto_destinoFK
    };
    try {
      await crearVuelo(payload);
      setShowConfirm(true);
      setSuccess("Vuelo creado exitosamente.");
      setTimeout(() => {
        setShowConfirm(false);
        navigate("/panelAdministrador");
      }, 2000);
    } catch {
      setError("Error al crear vuelo");
    } finally {
      setLoading(false);
    }
  };

  return {
  aeropuertos,
  aeronaves,
    form,
    setForm,
    salidaDate,
    setSalidaDate,
    llegadaDate,
    setLlegadaDate,
    error,
    setError,
    loading,
    handleTarifaChange,
    handleChange,
    handleSubmit,
  };
}
