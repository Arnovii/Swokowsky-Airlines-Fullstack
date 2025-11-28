import { useState, useEffect } from "react";
import type { CrearVueloPayload } from "../types/vuelo";
import { getVueloById, getNoticiaById, editarVuelo, verificarVentasVuelo, type VueloAPIResponse, type UpdateFlightPayload } from "../services/flightsEdit";

// Destinos internacionales (fuera de Colombia)
const DESTINOS_INTERNACIONALES = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];

// Tiempos mínimos antes del vuelo (en milisegundos)
const TIEMPO_MINIMO_NACIONAL = 60 * 60 * 1000; // 1 hora
const TIEMPO_MINIMO_INTERNACIONAL = 3 * 60 * 60 * 1000; // 3 horas

export function useEditarVuelo(id: string | undefined) {
  const [vueloOriginal, setVueloOriginal] = useState<VueloAPIResponse | null>(null);
  const [form, setForm] = useState<CrearVueloPayload | null>(null);
  const [salidaDate, setSalidaDate] = useState<Date | null>(null);
  const [llegadaDate, setLlegadaDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [puedeEditar, setPuedeEditar] = useState(true);
  const [tieneVentas, setTieneVentas] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    // Cargar vuelo y noticia en paralelo
    Promise.all([
      getVueloById(Number(id)),
      getNoticiaById(Number(id))
    ])
      .then(([vueloData, noticiaData]) => {
        if (vueloData) {
          setVueloOriginal(vueloData);
          
          // Transformar datos de la API al formato del formulario
          const formData: CrearVueloPayload = {
            id_aeronaveFK: vueloData.id_aeronaveFK,
            id_aeropuerto_origenFK: vueloData.id_aeropuerto_origenFK,
            id_aeropuerto_destinoFK: vueloData.id_aeropuerto_destinoFK,
            salida_programada_utc: vueloData.salida_programada_utc,
            llegada_programada_utc: vueloData.llegada_programada_utc,
            id_promocionFK: vueloData.id_promocionFK,
            estado: vueloData.estado as "Programado" | "En vuelo" | "Cancelado",
            // Datos de la noticia
            titulo: noticiaData?.titulo || "",
            descripcion_corta: noticiaData?.descripcion_corta || "",
            descripcion_larga: noticiaData?.descripcion_larga || "",
            url_imagen: noticiaData?.url_imagen || "",
            tarifa: vueloData.tarifa.map(t => ({
              clase: t.clase,
              precio_base: t.precio_base
            })),
            // Datos de promoción de la noticia si existe
            promocion: noticiaData?.promocion ? true : false,
            promo_nombre: noticiaData?.promocion?.nombre || "",
            promo_descripcion: noticiaData?.promocion?.descripcion || "",
            descuento: noticiaData?.promocion?.descuento ? String(noticiaData.promocion.descuento * 100) : "",
            promocion_inicio: noticiaData?.promocion?.fecha_inicio || "",
            promocion_fin: noticiaData?.promocion?.fecha_fin || "",
          };
          
          setForm(formData);
          setSalidaDate(vueloData.salida_programada_utc ? new Date(vueloData.salida_programada_utc) : null);
          setLlegadaDate(vueloData.llegada_programada_utc ? new Date(vueloData.llegada_programada_utc) : null);
          
          // Verificar si tiene ventas
          const hayVentas = verificarVentasVuelo(vueloData);
          setTieneVentas(hayVentas);
          setPuedeEditar(vueloData.estado === "Programado" && !hayVentas);
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
  }, [id]);

  const handleTarifaChange = (clase: string, precio: number) => {
    if (!form) return;
    const tarifas = [...form.tarifa];
    const index = tarifas.findIndex(t => t.clase === clase);
    if (index !== -1) {
      tarifas[index].precio_base = precio;
    }
    setForm({ ...form, tarifa: tarifas });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (
    e: React.FormEvent,
    _anunciarPromo: boolean,
    _navigate: (url: string) => void,
    setShowConfirm: (v: boolean) => void,
    setSuccess: (msg: string) => void
  ) => {
    e.preventDefault();
    if (!form || !id || !salidaDate || !llegadaDate || !vueloOriginal) return;
    
    // Validar tiempo mínimo antes del vuelo
    const ahora = new Date();
    const tiempoHastaVuelo = salidaDate.getTime() - ahora.getTime();
    
    // Determinar si es vuelo internacional basándose en los aeropuertos
    const ciudadOrigen = vueloOriginal.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.nombre || "";
    const ciudadDestino = vueloOriginal.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.nombre || "";
    
    // Es internacional si origen o destino están en la lista de destinos internacionales
    const esInternacional = DESTINOS_INTERNACIONALES.some(ciudad => 
      ciudadOrigen.toLowerCase().includes(ciudad.toLowerCase()) || 
      ciudadDestino.toLowerCase().includes(ciudad.toLowerCase())
    );
    
    const tiempoMinimo = esInternacional ? TIEMPO_MINIMO_INTERNACIONAL : TIEMPO_MINIMO_NACIONAL;
    const tipoVuelo = esInternacional ? "internacional" : "nacional";
    const horasMinimas = esInternacional ? "3 horas" : "1 hora";
    
    if (tiempoHastaVuelo < tiempoMinimo) {
      setError(`No se puede editar un vuelo ${tipoVuelo} con menos de ${horasMinimas} de anticipación. Por favor selecciona una fecha/hora posterior.`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Construir payload solo con los campos que acepta el backend
      const updatePayload: UpdateFlightPayload = {
        salida_programada_utc: salidaDate.toISOString(),
        llegada_programada_utc: llegadaDate.toISOString(),
      };

      // Agregar promoción si está habilitada
      if (form.promocion && form.promo_nombre && form.promo_descripcion && form.descuento && form.promocion_inicio && form.promocion_fin) {
        updatePayload.promocion = {
          nombre: form.promo_nombre,
          descripcion: form.promo_descripcion,
          descuento: Number(form.descuento) / 100, // Convertir porcentaje a decimal
          fecha_inicio: form.promocion_inicio,
          fecha_fin: form.promocion_fin,
        };
        
        // Si ya existe una promoción, incluir su ID
        if (vueloOriginal?.promocion?.id_promocion) {
          updatePayload.promocion.id_promocion = vueloOriginal.promocion.id_promocion;
        }
      }

      await editarVuelo(Number(id), updatePayload);
      setSuccess("Vuelo editado exitosamente");
      setShowConfirm(true);
    } catch (error) {
      console.error("Error al editar vuelo:", error);
      setError("Error al editar el vuelo");
    } finally {
      setLoading(false);
    }
  };

  return {
    vuelo: vueloOriginal,
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
    tieneVentas,
  };
}
