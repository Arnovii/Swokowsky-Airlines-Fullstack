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
}

export default function TransactionHistory() {
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const navigate = useNavigate();

const fetchTransactions = async () => {
    try {
    setLoading(true);

    // ✅ Usando el mismo endpoint GET /tickets
    const res = await api.get("/tickets");

    let data = res.data;
    if (!Array.isArray(data) && data?.data) {
        data = data.data;
    }

    // 🔥 Convertimos TICKETS → TRANSACCIONES
    const mapped: Transaction[] = (data ?? []).map((t: any) => ({
        id_transaccion: t.id_ticket,
        monto: t.precio,
        estado: t.estado?.toUpperCase(),
        fecha: t.creado_en,
        descripcion: "Compra de ticket",
        metodo_pago: t.metodo_pago || "Tarjeta registrada",
    }));

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex justify-center">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#081225]">
            Historial de Transacciones
        </h1>

        <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
        >
            ← Volver
        </button>
        </div>

        {/* Loading */}
        {loading && (
        <div className="text-center py-10 text-gray-500">
            Cargando historial…
        </div>
        )}

        {/* Error */}
        {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded-lg text-center mb-4">
            {error}
        </div>
        )}

        {/* Empty */}
        {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-10 text-gray-500">
            No tienes transacciones registradas.
        </div>
        )}

        {/* List */}
        <div className="space-y-4">
        {transactions.map((tx) => {
            const isPaid =
            tx.estado === "PAGADA" ||
            tx.estado === "CONFIRMADO" ||
            tx.estado === "PAGADO";

            const isCancelled = tx.estado === "CANCELADA" || tx.estado === "CANCELADO";

            return (
            <div
                key={tx.id_transaccion}
                className="p-5 bg-gray-50 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all"
            >
                <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#081225]">
                    Transacción #{tx.id_transaccion}
                </h2>

                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isPaid
                        ? "bg-green-100 text-green-700 border border-green-700"
                        : isCancelled
                        ? "bg-red-100 text-red-700 border border-red-700"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-700"
                    }`}
                >
                    {tx.estado}
                </span>
                </div>

                <div className="mt-3 text-gray-700 space-y-1">
                <p className="text-sm">
                    <span className="font-semibold">Fecha:</span>{" "}
                    {new Date(tx.fecha).toLocaleString("es-ES")}
                </p>

                <p className="text-sm">
                    <span className="font-semibold">Monto:</span>{" "}
                    {formatCOP(tx.monto)}
                </p>

                {tx.metodo_pago && (
                    <p className="text-sm">
                    <span className="font-semibold">Método de pago:</span>{" "}
                    {tx.metodo_pago}
                    </p>
                )}

                {tx.descripcion && (
                    <p className="text-sm italic mt-2">{tx.descripcion}</p>
                )}
                </div>
            </div>
            );
        })}
        </div>
    </div>
    </div>
);
}
