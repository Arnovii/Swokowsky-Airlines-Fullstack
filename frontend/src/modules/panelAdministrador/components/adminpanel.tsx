import React, { useState, useMemo } from "react";
import { DiVim } from "react-icons/di";
import { Link } from "react-router-dom";



interface Vuelo {
  codigo: string;
  origen: string;
  destino: string;
  fecha: string;  // YYYY-MM-DD
  estado: "Programado" | "En vuelo" | "Cancelado";
  ventas: number;
}

const vuelosData: Vuelo[] = [
  { codigo: "V001", origen: "Bogotá", destino: "Medellín", fecha: "2025-09-21", estado: "Programado", ventas: 120 },
  { codigo: "V002", origen: "Cali", destino: "Cartagena", fecha: "2025-09-22", estado: "En vuelo", ventas: 90 },
  { codigo: "V003", origen: "Medellín", destino: "Barranquilla", fecha: "2025-09-23", estado: "Cancelado", ventas: 0 },
  { codigo: "V004", origen: "Bogotá", destino: "Cali", fecha: "2025-09-24", estado: "Programado", ventas: 150 },
];

export const AdminPanel: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"Todos" | Vuelo["estado"]>("Todos");

  const vuelosFiltrados = useMemo(() => {
    return vuelosData.filter((v) => {
      const matchBusqueda =
        v.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.origen.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.destino.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado = filtroEstado === "Todos" || v.estado === filtroEstado;

      return matchBusqueda && matchEstado;
    });
  }, [busqueda, filtroEstado]);

  const handleAccion = (codigo: string) => {
    alert(`Acción en vuelo ${codigo}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-sans mb-4">Panel de Administrador</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Buscar por código, origen o destino..."
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
          onClick={() => handleAccion(vuelo.codigo)}
          className="text-white px-3 py-1 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
        >
          Crear Nuevo Vuelo
        </button>




      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Código</th>
              <th className="py-2 px-4 border-b text-left">Origen</th>
              <th className="py-2 px-4 border-b text-left">Destino</th>
              <th className="py-2 px-4 border-b text-left">Fecha</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Tickets Vendidios</th>
              <th className="py-2 px-4 border-b text-left">Informacion</th>
            </tr>
          </thead>
          <tbody>
            {vuelosFiltrados.map((vuelo) => (
              <tr key={vuelo.codigo} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{vuelo.codigo}</td>
                <td className="py-2 px-4 border-b">{vuelo.origen}</td>
                <td className="py-2 px-4 border-b">{vuelo.destino}</td>
                <td className="py-2 px-4 border-b">{vuelo.fecha}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${vuelo.estado === "Programado"
                      ? "bg-blue-100 text-blue-800"
                      : vuelo.estado === "En vuelo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {vuelo.estado}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{vuelo.ventas}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex flex-wrap items-center space-x-2">
                    <Link
                      to={`/panelAdministrador/vuelo/${vuelo.codigo}`}
                      className="inline-block min-w-[130px] text-center text-white px-3 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
                    >
                      Ver Detalles
                    </Link>

                    <button
                      onClick={() => handleAccion(vuelo.codigo)}
                      className="inline-block min-w-[130px] text-center text-white px-3 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
                    >
                      Editar Vuelo
                    </button>

                    <button
                      onClick={() => handleAccion(vuelo.codigo)}
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
