// frontend/src/modules/user_profile/pages/TransactionHistory.tsx

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

interface Transaction {
id_transaccion: number;
monto: number;
estado: string;
fecha: string;
descripcion?: string;
metodo_pago?: string;
origen_iata?: string;
destino_iata?: string;
}

export default function TransactionHistory() {
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const navigate = useNavigate();

const fetchTransactions = async () => {
    try {
    setLoading(true);

    // Reutilizamos /tickets para construir el historial
    const res = await api.get("/tickets");

    let data = res.data;
    if (!Array.isArray(data) && data?.data) {
        data = data.data;
    }

    const mapped: Transaction[] = (data ?? [])
        .map((t: any) => {
        const estadoRaw = (t.estado ?? "") as string;
        const estadoUpper = estadoRaw.toUpperCase();

        const origen_iata =
            t.vuelo?.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
            ?.codigo_iata;
        const destino_iata =
            t.vuelo?.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
            ?.codigo_iata;

        return {
            id_transaccion: t.id_ticket,
            monto: t.precio,
            estado: estadoUpper,
            fecha: t.creado_en,
            descripcion: "Compra de ticket",
            metodo_pago: t.metodo_pago || "Saldo",
            origen_iata,
            destino_iata,
        } as Transaction;
        })
        // 👇 Solo dejamos movimientos que implican dinero:
        // pagados/confirmados (cobro) y cancelados/reembolsados (devolución).
        .filter((tx: Transaction) => {
        const e = tx.estado;
        const isPaid =
            e === "PAGADA" || e === "PAGADO" || e === "CONFIRMADO";
        const isRefunded =
            e === "CANCELADA" ||
            e === "CANCELADO" ||
            e === "REEMBOLSADO";

        return isPaid || isRefunded;
        });

    setTransactions(mapped);
    } catch (err: any) {
    console.error("Error obteniendo historial:", err?.response?.data || err);
    setError(
        err?.response?.data?.message ||
        "No se pudo cargar el historial de transacciones."
    );
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchTransactions();
}, []);

const formatCOP = (monto: number) => {
    try {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(monto);
    } catch {
    return `COP ${monto}`;
    }
};

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
        {/* Header profesional con degradado sutil */}
        <div className="bg-gradient-to-r from-[#0F2C59] via-[#1a4278] to-[#0F6899] rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-slate-200/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
                </div>
                <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Historial de Transacciones
                </h1>
                <p className="text-slate-200 text-sm mt-1">
                    Consulta tus movimientos y compras realizadas
                </p>
                </div>
            </div>
            </div>

            <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/95 hover:bg-white text-[#0F6899] rounded-xl transition-all duración-300 hover:scale-105 active:scale-95 shadow-lg font-medium w-full sm:w-auto justify-center"
            >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
                />
            </svg>
            <span>Volver a mi perfil</span>
            </button>
        </div>
        </div>

        {/* Loading State */}
        {loading && (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-[#0F6899] rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">
            Cargando transacciones...
            </p>
        </div>
        )}

        {/* Error State */}
        {error && (
        <div className="bg-white border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                className="w-6 h-6 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                />
                </svg>
            </div>
            <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                Error al cargar
                </h3>
                <p className="text-slate-600 mt-1">{error}</p>
            </div>
            </div>
        </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-100">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Sin transacciones
            </h3>
            <p className="text-slate-500">
            Aún no tienes transacciones registradas en tu cuenta
            </p>
        </div>
        )}

        {/* Transactions List */}
        {!loading && !error && transactions.length > 0 && (
        <div className="space-y-4">
            {transactions.map((tx) => {
            const estado = tx.estado;

            const isPaid =
                estado === "PAGADA" ||
                estado === "PAGADO" ||
                estado === "CONFIRMADO";

            const isCancelled =
                estado === "CANCELADA" ||
                estado === "CANCELADO" ||
                estado === "REEMBOLSADO";

            const displayEstado = isCancelled ? "REEMBOLSADO" : estado;

            const routeLabel =
                tx.origen_iata && tx.destino_iata
                ? `${tx.origen_iata} → ${tx.destino_iata}`
                : "Ruta no disponible";

            return (
                <div
                key={tx.id_transaccion}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
                >
                {/* Header con gradiente sutil */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F6899] to-[#0F2C59] rounded-xl flex items-center justify-center shadow-md">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Transacción #{tx.id_transaccion}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {tx.descripcion}
                        </p>
                        {/* 👇 Origen y destino del vuelo */}
                        <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wide">
                            {routeLabel}
                        </p>
                        </div>
                    </div>

                    <span
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                        isPaid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isCancelled
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                    >
                        {displayEstado}
                    </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Monto */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                        <svg
                            className="w-5 h-5 text-[#0F6899]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Monto
                        </p>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">
                        {formatCOP(tx.monto)}
                        </p>
                    </div>

                    {/* Fecha */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                        <svg
                            className="w-5 h-5 text-[#0F6899]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Fecha
                        </p>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                        {new Date(tx.fecha).toLocaleString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                        {new Date(tx.fecha).toLocaleString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        </p>
                    </div>

                    {/* Método de pago */}
                    {tx.metodo_pago && (
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <svg
                            className="w-5 h-5 text-[#0F6899]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                            </svg>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Método de pago
                            </p>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                            {tx.metodo_pago}
                        </p>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            );
            })}
        </div>
        )}
    </div>
    </div>
);
}
