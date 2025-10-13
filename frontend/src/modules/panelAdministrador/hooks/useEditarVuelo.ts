import { useState, useEffect } from "react";
import type { CrearVueloPayload, Tarifa } from "../types/vuelo";
import { editarVuelo } from "../services/flightsEdit";

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
    // Aquí deberías cargar los datos del vuelo por id y cupos disponibles desde tu API
    // Ejemplo:
    // api.get(`/news/${id}`).then(res => { setVuelo(res.data); setForm(res.data); ... })
    // setPuedeEditar(según lógica de negocio)
    // setCuposDisponibles(res.data.cuposDisponibles)
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
    anunciarPromo: boolean,
    navigate: (url: string) => void,
    setShowConfirm: (v: boolean) => void,
    setSuccess: (msg: string) => void
  ) => {
    e.preventDefault();
    if (!form || !id) return;
    setLoading(true);
    try {
      await editarVuelo(Number(id), form);
      setSuccess("Vuelo editado exitosamente");
      setShowConfirm(true);
      // Si anunciarPromo, deberías crear la noticia aquí
    } catch (err: any) {
      setError("Error al editar el vuelo");
    } finally {
      setLoading(false);
    }
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
