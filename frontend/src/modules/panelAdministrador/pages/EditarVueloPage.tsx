import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEditarVuelo } from "../hooks/useEditarVuelo";

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
  } = useEditarVuelo(id);



  // Todos los hooks deben ir antes de cualquier return condicional
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);


  useEffect(() => {
    if (vuelo && !form) {
      setForm(vuelo);
      setSalidaDate(vuelo.salida_programada_utc ? new Date(vuelo.salida_programada_utc) : null);
      setLlegadaDate(vuelo.llegada_programada_utc ? new Date(vuelo.llegada_programada_utc) : null);
    }
  }, [vuelo, form, setForm, setSalidaDate, setLlegadaDate]);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => {
        setShowConfirm(false);
        navigate("/admin");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm, navigate]);

  // Render condicional para loading, error y datos faltantes
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg">Cargando datos del vuelo...</p></div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-red-600">Error: {error}</p></div>;
  }
  if (!form) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg">No se encontró información del vuelo.</p></div>;
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
    // Validación de promoción si aplica
    if (form.promocion) {
      if (!form.promo_nombre || form.promo_nombre.trim() === "") {
        nuevosErrores.promo_nombre = "El nombre de la promoción es obligatorio";
      }
      if (!form.promo_descripcion || form.promo_descripcion.trim() === "") {
        nuevosErrores.promo_descripcion = "La descripción de la promoción es obligatoria";
      }
      if (!form.descuento || Number(form.descuento) <= 0) {
        nuevosErrores.descuento = "El descuento debe ser mayor a 0";
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
  handleSubmit(e, true, navigate, setShowConfirm, () => {}); // La promoción siempre se anuncia
    }
  };

  if (!puedeEditar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-10 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No se puede editar este vuelo</h2>
          <p className="mb-4">El vuelo ya sucedió o tiene tiquetes vendidos. Solo puedes cancelar el vuelo.</p>
          <button onClick={() => navigate("/admin")} className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-xl font-bold shadow">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#081225] via-[#123361] to-[#39A5D8] flex flex-col justify-center items-center p-4 md:p-16 font-sans animate-gradient-move">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-12 md:p-24 w-full max-w-4xl border-2 border-[#39A5D8] flex flex-col gap-14 font-sans transition-all duration-300">
        <h2 className="text-4xl font-bold text-[#0F6899] mb-8 text-center font-sans drop-shadow-lg">Editar Vuelo</h2>
        <form onSubmit={handleSubmitPersonalizado} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-4">
            <div className="col-span-1">
              <label className="block mb-2 font-semibold text-[#0F6899]">Título de la noticia</label>
              <input
                type="text"
                name="titulo"
                value={form?.titulo || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.titulo ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="Ej: Nuevo vuelo Bogotá → Barranquilla"
              />
              {errores.titulo && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.titulo}</p>}
            </div>
            <div className="col-span-1">
              <label className="block mb-2 font-semibold text-[#0F6899]">Descripción corta</label>
              <input
                type="text"
                name="descripcion_corta"
                value={form?.descripcion_corta || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white shadow-sm transition-all duration-200 ${errores.descripcion_corta ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="Ej: Paseos a la costa pa"
              />
              {errores.descripcion_corta && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.descripcion_corta}</p>}
            </div>
          </div>
          <div className="w-full mb-4">
            <label className="block mb-2 font-semibold text-[#0F6899]">Descripción larga</label>
            <textarea
              name="descripcion_larga"
              value={form?.descripcion_larga || ""}
              onChange={e => setForm(f => ({ ...f!, descripcion_larga: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white min-h-[80px] shadow-sm transition-all duration-200 ${errores.descripcion_larga ? 'border-red-500' : 'border-[#39A5D8]'}`}
              placeholder="Detalles del servicio, frecuencias, servicios a bordo..."
              rows={3}
            />
            {errores.descripcion_larga && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.descripcion_larga}</p>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Aeropuerto Origen</label>
              <input
                type="number"
                name="id_aeropuerto_origenFK"
                value={form?.id_aeropuerto_origenFK || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.id_aeropuerto_origenFK ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="ID Origen"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">Aeropuerto Destino</label>
              <input
                type="number"
                name="id_aeropuerto_destinoFK"
                value={form?.id_aeropuerto_destinoFK || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.id_aeropuerto_destinoFK ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholder="ID Destino"
              />
            </div>
          </div>
          <div className="w-full">
            <label className="block mb-2 font-medium text-[#0F6899]">URL de la imagen del vuelo</label>
            <input
              type="url"
              name="url_imagen"
              value={form?.url_imagen || ""}
              onChange={e => setForm(f => ({ ...f!, url_imagen: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white shadow-sm transition-all duration-200 ${errores.url_imagen ? 'border-red-500' : 'border-[#39A5D8]'}`}
              placeholder="https://..."
            />
            {errores.url_imagen && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.url_imagen}</p>}
            {form?.url_imagen && (
              <div className="flex justify-center mt-4">
                <img src={form.url_imagen} alt="Preview" className="rounded-2xl shadow-xl border-2 border-[#39A5D8] w-full max-w-xs max-h-40 object-cover" />
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Salida Programada (UTC)</label>
              <DatePicker
                selected={salidaDate}
                onChange={date => setSalidaDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={new Date()}
                maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.salida ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholderText="Selecciona fecha y hora"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">Llegada Programada (UTC)</label>
              <DatePicker
                selected={llegadaDate}
                onChange={date => setLlegadaDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={salidaDate || new Date()}
                maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d; })()}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.llegada ? 'border-red-500' : 'border-[#39A5D8]'}`}
                placeholderText="Selecciona fecha y hora"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Precio Económica</label>
              <input
                type="text"
                placeholder="0"
                value={form?.tarifa[0].precio_base.toLocaleString("es-CO")}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  handleTarifaChange("economica", Number(raw));
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 pr-20 ${errores.tarifa_economica ? 'border-red-500' : 'border-[#39A5D8]'}`}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">Precio Primera Clase</label>
              <input
                type="text"
                placeholder="0"
                value={form?.tarifa[1].precio_base.toLocaleString("es-CO")}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  handleTarifaChange("primera_clase", Number(raw));
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 pr-20 ${errores.tarifa_premium ? 'border-red-500' : 'border-[#39A5D8]'}`}
              />
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
                  value={form?.promocion ? "si" : "no"}
                  onChange={e => setForm(f => ({ ...f!, promocion: e.target.value === "si" }))}
                  className="w-full px-4 py-3 border border-[#b6d6f2] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent bg-white"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
              {form?.promocion && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <label className="block mb-2 font-medium">Nombre de la promoción</label>
                      <input
                        type="text"
                        name="promo_nombre"
                        value={form?.promo_nombre || ""}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promo_nombre ? 'border-red-500' : 'border-[#39A5D8]'}`}
                        placeholder="Ej: Black November"
                      />
                      {errores.promo_nombre && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.promo_nombre}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 font-medium">Descripción de la promoción</label>
                      <textarea
                        name="promo_descripcion"
                        value={form?.promo_descripcion || ""}
                        onChange={e => setForm(f => ({ ...f!, promo_descripcion: e.target.value }))}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 ${errores.promo_descripcion ? 'border-red-500' : 'border-[#39A5D8]'}`}
                        placeholder="Describe la promoción"
                        rows={2}
                      />
                      {errores.promo_descripcion && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.promo_descripcion}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-end">
                    <div>
                      <label className="block mb-2 font-medium">Descuento (%)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        name="descuento"
                        value={form?.descuento || ""}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#39A5D8] focus:border-transparent bg-white text-lg font-bold shadow-sm transition-all duration-200 appearance-none ${errores.descuento ? 'border-red-500' : 'border-[#39A5D8]'}`}
                        placeholder="Ej: 20"
                      />
                      {errores.descuento && <p className="text-red-500 text-sm mt-1 font-semibold">{errores.descuento}</p>}
                    </div>
                    <div className="md:ml-10">
                      <label className="block mb-2 font-medium">Inicio promoción</label>
                      <DatePicker
                        selected={form?.promocion_inicio ? new Date(form.promocion_inicio) : null}
                        onChange={date => setForm(f => ({ ...f!, promocion_inicio: date ? date.toISOString() : "" }))}
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
                        selected={form?.promocion_fin ? new Date(form.promocion_fin) : null}
                        onChange={date => setForm(f => ({ ...f!, promocion_fin: date ? date.toISOString() : "" }))}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        minDate={form?.promocion_inicio ? new Date(form.promocion_inicio) : new Date()}
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
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => navigate("/admin")} className="px-6 py-3 bg-gradient-to-r from-[#eaf6ff] to-[#39A5D8] text-[#0F6899] rounded-xl font-bold shadow hover:scale-105 hover:bg-[#39A5D8]/80 transition-all duration-300 border-2 border-[#39A5D8]">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-xl font-bold shadow hover:scale-105 hover:shadow-[#3B82F6]/20 transition-all duration-300 border-2 border-[#39A5D8]">{loading ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </form>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-4 text-[#0F6899]">¡Vuelo editado exitosamente!</h3>
              <p className="mb-4">Los cambios han sido guardados y serán visibles en el panel de administración.</p>
              <button onClick={() => { setShowConfirm(false); navigate("/admin"); }} className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg font-bold">Aceptar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarVueloPage;