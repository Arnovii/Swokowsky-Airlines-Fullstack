import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";


interface Aeropuerto{
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
  aeronave: Aeronave,
  aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: Aeropuerto,
  aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: Aeropuerto,
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

  // --- Cargar datos desde el backend ---
  useEffect(() => {
    axios.get<Vuelo[]>("http://localhost:3000/api/v1/flights")
      // si tu endpoint exige token, agrega:
      // .get<Vuelo[]>("http://localhost:3000/api/v1/flights", {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
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

  const handleAccion = (codigo: number) => {
    alert(`Acción en vuelo ${codigo}`);
  };

  if (loading) return <p className="p-6">Cargando vuelos...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-sans mb-4">Panel de Administrador</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Buscar por ID de vuelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/2"
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Programado">Programado</option>
          <option value="En vuelo">En vuelo</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <button
          onClick={() => alert("Crear Nuevo Vuelo")}
          className="text-white px-3 py-1 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
        >
          Crear Nuevo Vuelo
        </button>

        <button
          onClick={() => alert("Editar Perfil Admin")}
          className="text-white px-3 py-1 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
        >
          Editar Perfil Admin
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">ID Vuelo</th>
              <th className="py-2 px-4 border-b text-left">Aeronave</th>
              <th className="py-2 px-4 border-b text-left">Capacidad</th>
              <th className="py-2 px-4 border-b text-left">Aeropuertos (Origen → Destino)</th>
              <th className="py-2 px-4 border-b text-left">Salida Programada</th>
              <th className="py-2 px-4 border-b text-left">Llegada Programada</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vuelosFiltrados.map((vuelo) => (
              <tr key={vuelo.id_vuelo} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{vuelo.id_vuelo}</td>
                <td className="py-2 px-4 border-b">{vuelo.aeronave?.modelo}</td>
                <td className="py-2 px-4 border-b">{vuelo.aeronave?.capacidad}</td>
                <td className="py-2 px-4 border-b">
                  {vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.codigo_iata} → {vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.codigo_iata}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(vuelo.salida_programada_utc).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(vuelo.llegada_programada_utc).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      vuelo.estado === "Programado"
                        ? "bg-blue-100 text-blue-800"
                        : vuelo.estado === "En vuelo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vuelo.estado}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex flex-wrap items-center space-x-2">
                    <button
                      onClick={() => handleAccion(vuelo.id_vuelo)}
                      className="inline-block min-w-[130px] text-center text-white px-3 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
                    >
                      Editar Vuelo
                    </button>

                    <button
                      onClick={() => handleAccion(vuelo.id_vuelo)}
                      className="inline-block min-w-[130px] text-center text-white px-3 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
                    >
                      Eliminar Vuelo
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {vuelosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
