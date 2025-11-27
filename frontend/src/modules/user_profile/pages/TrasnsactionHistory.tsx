import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type EstadoTransaccion = "pagada" | "cancelada";

interface Transaccion {
id: string;
referencia: string;
fecha: string;       // ISO o string legible
hora: string;        // opcional pero queda bonito
monto: number;
moneda: "COP";
estado: EstadoTransaccion;
metodo: string;      // "Tarjeta VISA", "Monedero", etc.
descripcion: string;
}

// Utilidad similar a la del Perfil
const formatCOP = (n: number) => {
try {
    return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
    }).format(n);
} catch {
    return `$${n.toLocaleString("es-CO")} COP`;
}
};

// Datos mock de ejemplo (luego se reemplazan por datos reales del backend)
const MOCK_TRANSACCIONES: Transaccion[] = [
{
    id: "1",
    referencia: "TRX-2025-0001",
    fecha: "2025-11-20",
    hora: "14:32",
    monto: 150000,
    moneda: "COP",
    estado: "pagada",
    metodo: "Tarjeta VISA terminada en 1234",
    descripcion: "Compra de tiquetes Pereira - Bogotá",
},
{
    id: "2",
    referencia: "TRX-2025-0002",
    fecha: "2025-11-18",
    hora: "10:05",
    monto: 85000,
    moneda: "COP",
    estado: "cancelada",
    metodo: "Monedero Swokowsky",
    descripcion: "Reserva cancelada Medellín - Cartagena",
},
{
    id: "3",
    referencia: "TRX-2025-0003",
    fecha: "2025-11-15",
    hora: "20:47",
    monto: 220000,
    moneda: "COP",
    estado: "pagada",
    metodo: "Tarjeta Mastercard terminada en 5678",
    descripcion: "Compra de tiquetes Cali - San Andrés",
},
];

const badgeEstado = (estado: EstadoTransaccion) => {
const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold";
if (estado === "pagada") {
    return (
    <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
        ● Pagada
    </span>
    );
}
return (
    <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>
    ● Cancelada
    </span>
);
};

export default function HistorialTransacciones() {
const navigate = useNavigate();

const [filtroEstado, setFiltroEstado] = useState<
    "todas" | "pagadas" | "canceladas"
>("todas");
const [busqueda, setBusqueda] = useState("");

// TODO: en el futuro, reemplazar MOCK_TRANSACCIONES por datos traídos del backend
// Ejemplo:
// const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
// useEffect(() => {
//   api.get("/transacciones/mis-transacciones").then((res) => {
//     setTransacciones(res.data);
//   });
// }, []);
const transacciones = MOCK_TRANSACCIONES;

const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter((t) => {
    if (filtroEstado === "pagadas" && t.estado !== "pagada") return false;
    if (filtroEstado === "canceladas" && t.estado !== "cancelada") return false;

    if (!busqueda.trim()) return true;

    const q = busqueda.toLowerCase();
    return (
        t.referencia.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q) ||
        t.metodo.toLowerCase().includes(q)
    );
    });
}, [transacciones, filtroEstado, busqueda]);

return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl w-full max-w-5xl border border-gray-100">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081225]">
            Historial de transacciones
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
            Consulta el detalle de tus pagos y transacciones canceladas.
            </p>
        </div>
        <button
            type="button"
            onClick={() => navigate("/perfil?tab=wallet")}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 font-medium text-sm sm:text-base"
        >
            Volver al perfil
        </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 sm:mb-6 space-y-3">
        {/* Tabs estado */}
        <div className="inline-flex rounded-lg bg-gray-50 p-1 border border-gray-100">
            <button
            type="button"
            onClick={() => setFiltroEstado("todas")}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all ${
                filtroEstado === "todas"
                ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            >
            Todas
            </button>
            <button
            type="button"
            onClick={() => setFiltroEstado("pagadas")}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all ${
                filtroEstado === "pagadas"
                ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            >
            Pagadas
            </button>
            <button
            type="button"
            onClick={() => setFiltroEstado("canceladas")}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-all ${
                filtroEstado === "canceladas"
                ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            >
            Canceladas
            </button>
        </div>

        {/* Buscador */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
            <input
                type="text"
                placeholder="Buscar por referencia, método o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm sm:text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
            </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
            {transaccionesFiltradas.length} transacción
            {transaccionesFiltradas.length !== 1 && "es"} encontrada
            {transaccionesFiltradas.length !== 1 && "s"}.
            </span>
        </div>
        </div>

        {/* Tabla / lista */}
        <div className="border border-gray-100 rounded-xl bg-gray-50">
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="bg-gray-100 text-xs sm:text-sm text-gray-600">
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Referencia</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Método</th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold">Monto</th>
                </tr>
            </thead>
            <tbody>
                {transaccionesFiltradas.length === 0 ? (
                <tr>
                    <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs sm:text-sm text-gray-500"
                    >
                    No se encontraron transacciones con los filtros actuales.
                    </td>
                </tr>
                ) : (
                transaccionesFiltradas.map((t) => (
                    <tr
                    key={t.id}
                    className="bg-white border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                    <td className="px-3 sm:px-4 py-3 align-top">
                        <div className="flex flex-col">
                        <span className="font-semibold text-[#081225] text-xs sm:text-sm">
                            {t.referencia}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-2">
                            {t.descripcion}
                        </span>
                        </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top text-xs sm:text-sm text-gray-600">
                        <div className="flex flex-col">
                        <span>{t.fecha}</span>
                        <span className="text-xs text-gray-400">{t.hora}</span>
                        </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top">
                        {badgeEstado(t.estado)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top text-xs sm:text-sm text-gray-600">
                        {t.metodo}
                    </td>
                    <td className="px-3 sm:px-4 py-3 align-top text-right">
                        <span className="font-semibold text-[#081225] text-xs sm:text-sm">
                        {formatCOP(t.monto)}
                        </span>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>

        {/* Nota / futuro filtros avanzados */}
        {/* <p className="mt-4 text-xs text-gray-400">
        En el futuro aquí se pueden añadir filtros por rango de fechas, método de pago, etc.
        </p> */}
    </div>
    </div>
);
}
