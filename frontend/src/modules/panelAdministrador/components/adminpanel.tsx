import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

interface Aeropuerto {
  id_aeropuerto: number;
  nombre: string;
  codigo_iata: string;
}

interface Aeronave {
  id_aeronave: number;
  modelo: string;
  capacidad: number;
}

interface Vuelo {
  id_vuelo: number;
  aeronave: Aeronave;
  aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: Aeropuerto;
  aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: Aeropuerto;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  id_promocionFK: number | null;
  estado: "Programado" | "En vuelo" | "Cancelado" | "Realizado" | string;

  // 🔥 Nuevos campos que vienen del backend
  ocupantes_primera_clase: number;
  ocupantes_segunda_clase: number;
}

type TabEstado = "Programado" | "Cancelado" | "Realizado";

export const AdminPanel: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [tabEstado, setTabEstado] = useState<TabEstado>("Programado");
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<Vuelo | null>(null);

  useEffect(() => {
    axios
      .get<Vuelo[]>("http://localhost:3000/api/v1/flights")
      .then((res) => setVuelos(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const ahora = new Date();

  const vuelosFiltrados = useMemo(() => {
    return vuelos.filter((v) => {
      const salidaDate = new Date(v.salida_programada_utc);
      const matchBusqueda = v.id_vuelo.toString().includes(busqueda);

      let perteneceATab = false;

      if (tabEstado === "Programado") {
        perteneceATab =
          v.estado === "Programado" && salidaDate.getTime() >= ahora.getTime();
      } else if (tabEstado === "Cancelado") {
        perteneceATab = v.estado === "Cancelado";
      } else if (tabEstado === "Realizado") {
        perteneceATab = salidaDate.getTime() < ahora.getTime();
      }

      return matchBusqueda && perteneceATab;
    });
  }, [busqueda, tabEstado, vuelos]);

  const handleEditarVuelo = (id: number) => {
    navigate(`/panelAdministrador/editar-vuelo/${id}`);
  };

  const handleAbrirModalEliminar = (vuelo: Vuelo) => {
    setVueloSeleccionado(vuelo);
    setShowDeleteModal(true);
  };

  const handleCerrarModalEliminar = () => {
    setShowDeleteModal(false);
    setVueloSeleccionado(null);
  };

  const handleConfirmarEliminarFrontend = async () => {
    if (!vueloSeleccionado) return;

    try {
      // Llamar al backend para cancelar el vuelo usando PATCH
      await axios.patch(`http://localhost:3000/api/v1/flights/${vueloSeleccionado.id_vuelo}`, {
        estado: "Cancelado"
      });

      // Actualizar el estado local: cambiar estado a "Cancelado" en vez de eliminar
      setVuelos((prev) =>
        prev.map((v) =>
          v.id_vuelo === vueloSeleccionado.id_vuelo
            ? { ...v, estado: "Cancelado" }
            : v
        )
      );

      handleCerrarModalEliminar();
    } catch (err: any) {
      console.error("Error al cancelar el vuelo:", err);
      alert(err?.response?.data?.message || "Error al cancelar el vuelo");
    }
  };

  if (loading) return <p className="p-6">Cargando vuelos...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#081225] mb-8">
            Panel de Administrador
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Buscar por ID de vuelo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="flex gap-2">
                <TabButton label="Programado" tab={tabEstado} setTab={setTabEstado} color="blue" />
                <TabButton label="Cancelado" tab={tabEstado} setTab={setTabEstado} color="red" />
                <TabButton label="Realizado" tab={tabEstado} setTab={setTabEstado} color="emerald" />
              </div>

              <Link to="/panelAdministrador/crear-vuelo">
                <button className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg">
                  ➕ Crear Nuevo Vuelo
                </button>
              </Link>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-[#081225] text-white">
                <tr>
                  <th className="py-4 px-6">ID Vuelo</th>
                  <th className="py-4 px-6">Aeronave</th>
                  <th className="py-4 px-6">Capacidad</th>
                  <th className="py-4 px-6">Ocupantes</th>
                  <th className="py-4 px-6">Ruta</th>
                  <th className="py-4 px-6">Salida</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {vuelosFiltrados.map((vuelo) => {
                  const salida = new Date(vuelo.salida_programada_utc);
                  const esRealizado = salida.getTime() < ahora.getTime();

                  const tienePasajeros =
                    vuelo.ocupantes_primera_clase > 0 ||
                    vuelo.ocupantes_segunda_clase > 0;

                  // Editable: siempre se puede editar si está programado y no ha sido realizado
                  const editable =
                    tabEstado === "Programado" &&
                    !esRealizado;

                  // Cancelable: solo si no tiene pasajeros
                  const cancelable = editable && !tienePasajeros;

                  return (
                    <tr key={vuelo.id_vuelo} className="hover:bg-gray-50">
                      <td className="py-4 px-6">{vuelo.id_vuelo}</td>

                      <td className="py-4 px-6 font-medium text-[#0F6899]">
                        {vuelo.aeronave?.modelo}
                      </td>

                      <td className="py-4 px-6">
                        {vuelo.aeronave?.capacidad}
                      </td>

                      {/* 🔥 Mostrar ocupantes */}
                      <td className="py-4 px-6">
                        {vuelo.ocupantes_primera_clase +
                          vuelo.ocupantes_segunda_clase}
                      </td>

                      <td className="py-4 px-6">
                        {
                          vuelo
                            .aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
                            ?.codigo_iata
                        }{" "}
                        →{" "}
                        {
                          vuelo
                            .aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
                            ?.codigo_iata
                        }
                      </td>

                      <td className="py-4 px-6">
                        {salida.toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        {esRealizado ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-700">
                            Realizado
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-700">
                            {vuelo.estado}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {editable ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditarVuelo(vuelo.id_vuelo)}
                              className="px-4 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                            >
                              ✏️ Editar
                            </button>

                            {cancelable ? (
                              <button
                                onClick={() => handleAbrirModalEliminar(vuelo)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                              >
                                ❌ Cancelar
                              </button>
                            ) : (
                              <button
                                disabled
                                title="No se puede cancelar porque hay pasajeros registrados"
                                className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60"
                              >
                                ❌ Cancelar
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No editable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {vuelosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No hay vuelos en esta categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showDeleteModal && vueloSeleccionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-bold">Confirmar cancelación</h2>
              <p className="mt-2 text-gray-600">
                ¿Deseas cancelar el vuelo #{vueloSeleccionado.id_vuelo}?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCerrarModalEliminar}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cerrar
                </button>

                <button
                  onClick={handleConfirmarEliminarFrontend}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Cancelar Vuelo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* --- componente botón de TAB --- */
function TabButton({
  label,
  tab,
  setTab,
  color
}: {
  label: TabEstado;
  tab: TabEstado;
  setTab: (t: TabEstado) => void;
  color: string;
}) {
  const active = tab === label;

  const colors: any = {
    blue: "bg-[#0F6899] border-[#0F6899]",
    red: "bg-red-600 border-red-600",
    emerald: "bg-emerald-600 border-emerald-600",
  };

  return (
    <button
      onClick={() => setTab(label)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
        active
          ? `${colors[color]} text-white shadow-md`
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

export default AdminPanel;