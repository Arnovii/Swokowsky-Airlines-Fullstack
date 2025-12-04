import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
codigoReserva?: string;
checkinData?: any;
}

export default function CheckinInfoPage() {
const navigate = useNavigate();
const location = useLocation();
const state = (location.state as LocationState) || {};
const codigoReserva = state.codigoReserva ?? "—";

const handleContinue = () => {
    navigate("/mapa-asientos", {
    state: {
        codigoReserva,
        checkinData: state.checkinData ?? null,
    },
    });
};

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Antes de continuar con tu check-in
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Te explicamos rápidamente cómo funciona el proceso.
            </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-right">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
            Código de reserva
            </p>
            <p className="text-base sm:text-lg font-bold text-[#0F6899] mt-1">
            {codigoReserva}
            </p>
        </div>
        </div>

        {/* Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-[#0F6899] uppercase tracking-wider">
            Paso 1
            </p>
            <h3 className="mt-1 font-semibold text-slate-900 text-sm">
            Verifica tus datos
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Confirmaremos tu vuelo, nombre y demás información básica de tu
            reserva para asegurarnos de que todo esté correcto.
            </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-[#0F6899] uppercase tracking-wider">
            Paso 2
            </p>
            <h3 className="mt-1 font-semibold text-slate-900 text-sm">
            Elige tu asiento
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Podrás seleccionar tu asiento en el mapa del avión. Algunos
            asientos pueden tener costo adicional según tu tarifa.
            </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-[#0F6899] uppercase tracking-wider">
            Paso 3
            </p>
            <h3 className="mt-1 font-semibold text-slate-900 text-sm">
            Confirma tu check-in
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Al final, confirmaremos tu selección y generaremos tu pase de
            abordar para que lo descargues o lo recibas en tu correo.
            </p>
        </div>
        </div>

        {/* Info extra */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-900">
        <p className="font-semibold mb-1">Recomendaciones:</p>
        <ul className="list-disc list-inside space-y-1">
            <li>
            Ten a la mano tu documento de identidad y el de tus acompañantes
            (si aplica).
            </li>
            <li>
            Verifica que los nombres coincidan exactamente con tus documentos.
            </li>
            <li>
            Llega al aeropuerto con la anticipación recomendada, incluso si
            ya realizaste tu check-in en línea.
            </li>
        </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
            type="button"
            onClick={() => navigate("/checkin")}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm sm:text-base hover:bg-slate-200 border border-slate-200 transition-all"
        >
            Volver a ingresar código
        </button>

        <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white text-sm sm:text-base font-semibold shadow-md shadow-[#3B82F6]/30 hover:shadow-lg hover:shadow-[#3B82F6]/40 transition-all"
        >
            Continuar al mapa de asientos
        </button>
        </div>
    </div>
    </div>
);
}
