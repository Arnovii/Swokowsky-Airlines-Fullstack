import { useState, useEffect } from "react";
import type { CrearVueloPayload } from "../types/vuelo";
// import { editarVuelo, getVueloById } from "../services/flightsEdit"; // Comentado para versión mock

export function useEditarVuelo(id: string | undefined) {
  const [vuelo, setVuelo] = useState<CrearVueloPayload | null>(null);
  const [form, setForm] = useState<CrearVueloPayload | null>(null);
  const [salidaDate, setSalidaDate] = useState<Date | null>(null);
  const [llegadaDate, setLlegadaDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [puedeEditar, setPuedeEditar] = useState(true);
  const [cuposDisponibles, setCuposDisponibles] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    // Simular datos mock para desarrollo estético
    const dataMock = {
      id_aeronaveFK: 1,
      id_aeropuerto_origenFK: 1,
      id_aeropuerto_destinoFK: 2,
      salida_programada_utc: "2024-12-25T10:00:00Z",
      llegada_programada_utc: "2024-12-25T14:30:00Z",
      id_promocionFK: null,
      estado: "Programado" as const,
      titulo: "Vuelo Navideño Especial",
      descripcion_corta: "Disfruta de un vuelo especial en estas fiestas navideñas",
      descripcion_larga: "Un vuelo único diseñado para celebrar la temporada navideña con servicios premium y atención especial para toda la familia. Incluye entretenimiento especial y menú festivo.",
      cupos_disponibles: 150,
      tiquetes_vendidos: false,
      tarifa: [
        { clase: "economica" as const, precio_base: 250000 },
        { clase: "primera_clase" as const, precio_base: 750000 }
      ]
    };
    
    // Simular delay de API
    setTimeout(() => {
      setVuelo(dataMock);
      setForm(dataMock);
      setSalidaDate(new Date(dataMock.salida_programada_utc));
      setLlegadaDate(new Date(dataMock.llegada_programada_utc));
      setPuedeEditar(dataMock.estado === "Programado" && !dataMock.tiquetes_vendidos);
      setCuposDisponibles(dataMock.cupos_disponibles || 0);
      setLoading(false);
    }, 1000);
    
    // Código original comentado para cuando esté listo el backend:
    /*
    getVueloById(Number(id))
      .then((data) => {
        if (data) {
          setVuelo(data);
          setForm(data);
          setSalidaDate(data.salida_programada_utc ? new Date(data.salida_programada_utc) : null);
          setLlegadaDate(data.llegada_programada_utc ? new Date(data.llegada_programada_utc) : null);
          setPuedeEditar(data.estado === "Programado" && !data.tiquetes_vendidos);
          setCuposDisponibles(data.cupos_disponibles || 0);
        } else {
          setError("No se encontró el vuelo");
        }
      })
      .catch((err) => {
        console.error("Error al cargar el vuelo:", err);
        setError("Error al cargar los datos del vuelo");
      })
      .finally(() => {
        setLoading(false);
      });
    */
  }, [id]);

  const handleTarifaChange = (clase: string, precio: number) => {
    if (!form) return;
    const tarifas = [...form.tarifa];
    if (clase === "economica") tarifas[0].precio_base = precio;
    if (clase === "primera_clase") tarifas[1].precio_base = precio;
    setForm({ ...form, tarifa: tarifas });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (
    e: React.FormEvent,
    anunciarPromo: boolean, // Se mantiene para compatibilidad pero siempre es true
    navigate: (url: string) => void,
    setShowConfirm: (v: boolean) => void,
    setSuccess: (msg: string) => void
  ) => {
    e.preventDefault();
    if (!form || !id) return;
    setLoading(true);
    
    // Simular edición exitosa (sin llamada real a API)
    setTimeout(() => {
      console.log("Simulando edición de vuelo:", form);
      setSuccess("Vuelo editado exitosamente (modo demo)");
      setShowConfirm(true);
      setLoading(false);
    }, 1500);
    
    // Código original comentado para cuando esté listo el backend:
    /*
    try {
      await editarVuelo(Number(id), form);
      setSuccess("Vuelo editado exitosamente");
      setShowConfirm(true);
      // La promoción siempre se anuncia automáticamente
    } catch (error) {
      console.error("Error al editar vuelo:", error);
      setError("Error al editar el vuelo");
    } finally {
      setLoading(false);
    }
    */
  };

  return {
    vuelo,
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
    puedeEditar,
    cuposDisponibles,
  };
}
