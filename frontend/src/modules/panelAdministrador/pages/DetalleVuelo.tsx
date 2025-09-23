import React from "react";
import { useParams, Link } from "react-router-dom";

const vuelosData = [
  { codigo: "V001", origen: "Bogotá", destino: "Medellín", fecha: "2025-09-21", estado: "Programado", ventas: 120 },
  { codigo: "V002", origen: "Cali", destino: "Cartagena", fecha: "2025-09-22", estado: "En vuelo", ventas: 90 },
  { codigo: "V003", origen: "Medellín", destino: "Barranquilla", fecha: "2025-09-23", estado: "Cancelado", ventas: 0 },
  { codigo: "V004", origen: "Bogotá", destino: "Cali", fecha: "2025-09-24", estado: "Programado", ventas: 150 },
];

export default function DetalleVuelo() {
  const { codigo } = useParams<{ codigo: string }>();
  const vuelo = vuelosData.find(v => v.codigo === codigo);

  if (!vuelo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white shadow-md rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Vuelo no encontrado
          </h1>
          <Link
            to="/panelAdministrador"
            className="inline-block text-white px-4 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
          >
            Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  // Colores dinámicos para el estado
  const estadoColor =
    vuelo.estado === "Programado"
      ? "bg-blue-100 text-blue-800"
      : vuelo.estado === "En vuelo"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0e254d] px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Detalle del Vuelo {vuelo.codigo}
          </h1>
        </div>

        {/* Contenido */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
          <p>
            <span className="font-semibold text-gray-900">Origen:</span> {vuelo.origen}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Destino:</span> {vuelo.destino}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Fecha:</span> {vuelo.fecha}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Ventas:</span> {vuelo.ventas}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold text-gray-900">Estado:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${estadoColor}`}
            >
              {vuelo.estado}
            </span>
          </p>
        </div>

        {/* Botón de volver */}
        <div className="px-6 py-4 bg-gray-50 text-right">
          <Link
            to="/panelAdministrador"
            className="inline-block text-white px-4 py-2 rounded bg-[#0e254d] font-sans hover:bg-[#0a1a3a] transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </div>
    </div>
  );
}




