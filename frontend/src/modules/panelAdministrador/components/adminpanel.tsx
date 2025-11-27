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
  estado: "Programado" | "En vuelo" | "Cancelado";
}

export const AdminPanel: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"Todos" | Vuelo["estado"]>("Todos");
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔴 estado para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<Vuelo | null>(null);

  // --- Cargar datos desde el backend ---
  useEffect(() => {
    axios
      .get<Vuelo[]>("http://localhost:3000/api/v1/flights")
      .then((res) => setVuelos(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const vuelosFiltrados = useMemo(() => {
    return vuelos.filter((v) => {
      const matchBusqueda = v.id_vuelo.toString().includes(busqueda);
      const matchEstado = filtroEstado === "Todos" || v.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [busqueda, filtroEstado, vuelos]);

  const handleEditarVuelo = (id: number) => {
    navigate(`/panelAdministrador/editar-vuelo/${id}`);
  };

  // 👉 abrir modal con datos del vuelo
  const handleAbrirModalEliminar = (vuelo: Vuelo) => {
    setVueloSeleccionado(vuelo);
    setShowDeleteModal(true);
  };

  const handleCerrarModalEliminar = () => {
    setShowDeleteModal(false);
    setVueloSeleccionado(null);
  };

  // 👉 eliminar solo en frontend (más adelante se conecta al endpoint)
  const handleConfirmarEliminarFrontend = () => {
    if (!vueloSeleccionado) return;
    setVuelos((prev) =>
      prev.filter((v) => v.id_vuelo !== vueloSeleccionado.id_vuelo)
    );
    // aquí en el futuro: llamada DELETE al backend
    // await axios.delete(`/api/v1/flights/${vueloSeleccionado.id_vuelo}`)
    handleCerrarModalEliminar();
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

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 md:w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por ID de vuelo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-300 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                className="md:w-1/4 pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-300 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Programado">Programado</option>
                <option value="En vuelo">En vuelo</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <button
                onClick={() => navigate("/panelAdministrador/crear-vuelo")}
                className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>➕</span>
                <span>Crear Nuevo Vuelo</span>
              </button>

              <Link to="/perfil">
                <button
                  onClick={() => null}
                  className="px-6 py-3 bg-[#081225] text-white rounded-lg hover:bg-[#0F6899] transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>👤</span>
                  <span>Ver Perfil</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#081225] text-white">
                  <tr>
                    <th className="py-4 px-6 text-left font-medium">ID Vuelo</th>
                    <th className="py-4 px-6 text-left font-medium">Aeronave</th>
                    <th className="py-4 px-6 text-left font-medium">Capacidad</th>
                    <th className="py-4 px-6 text-left font-medium">
                      Aeropuertos (Origen → Destino)
                    </th>
                    <th className="py-4 px-6 text-left font-medium">
                      Salida Programada
                    </th>
                    <th className="py-4 px-6 text-left font-medium">
                      Llegada Programada
                    </th>
                    <th className="py-4 px-6 text-left font-medium">Estado</th>
                    <th className="py-4 px-6 text-left font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vuelosFiltrados.map((vuelo) => (
                    <tr
                      key={vuelo.id_vuelo}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">{vuelo.id_vuelo}</td>
                      <td className="py-4 px-6 font-medium text-[#0F6899]">
                        {vuelo.aeronave?.modelo}
                      </td>
                      <td className="py-4 px-6">{vuelo.aeronave?.capacidad}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {
                              vuelo
                                .aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
                                ?.codigo_iata
                            }
                          </span>
                          <span className="text-[#3B82F6]">→</span>
                          <span className="font-medium">
                            {
                              vuelo
                                .aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
                                ?.codigo_iata
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {new Date(
                          vuelo.salida_programada_utc
                        ).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        {new Date(
                          vuelo.llegada_programada_utc
                        ).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            vuelo.estado === "Programado"
                              ? "bg-blue-100 text-[#0F6899] border border-[#0F6899]"
                              : vuelo.estado === "En vuelo"
                              ? "bg-green-100 text-green-700 border border-green-700"
                              : "bg-red-100 text-red-700 border border-red-700"
                          }`}
                        >
                          {vuelo.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleEditarVuelo(vuelo.id_vuelo)}
                            className="min-w-[130px] text-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white font-medium hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => handleAbrirModalEliminar(vuelo)}
                            className="min-w-[130px] text-center px-4 py-2 rounded-lg bg-[#081225] text-white font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {vuelosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No se encontraron resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ELIMINAR VUELO */}
      {showDeleteModal && vueloSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#081225] mb-2">
                Confirmar eliminación
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Estás a punto de eliminar el vuelo{" "}
                <span className="font-semibold">
                  #{vueloSeleccionado.id_vuelo}
                </span>
                . Revisa los detalles antes de continuar.
              </p>

              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Aeronave:</span>
                  <span className="font-medium">
                    {vueloSeleccionado.aeronave?.modelo} (
                    {vueloSeleccionado.aeronave?.capacidad} pax)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ruta:</span>
                  <span className="font-medium">
                    {
                      vueloSeleccionado
                        .aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
                        ?.codigo_iata
                    }{" "}
                    →{" "}
                    {
                      vueloSeleccionado
                        .aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
                        ?.codigo_iata
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Salida:</span>
                  <span className="font-medium">
                    {new Date(
                      vueloSeleccionado.salida_programada_utc
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Llegada:</span>
                  <span className="font-medium">
                    {new Date(
                      vueloSeleccionado.llegada_programada_utc
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className="font-semibold">
                    {vueloSeleccionado.estado}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-red-500">
                * Por ahora esta eliminación es solo visual (frontend). Cuando el
                endpoint esté listo, conectaremos esta acción al backend.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCerrarModalEliminar}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarEliminarFrontend}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/20 text-sm sm:text-base"
                >
                  Eliminar vuelo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
