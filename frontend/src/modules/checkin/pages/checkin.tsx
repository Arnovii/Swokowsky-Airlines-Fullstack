// frontend/src/modules/checkin/pages/checkin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../../../api/axios";  // 👈 lo usarás cuando el backend esté listo

type Step = 1 | 2 | 3;

const EXTRA_BAG_PRICE = 80000; // 💼 Precio de la maleta adicional (ajústalo a lo que uséis)

const CheckInPage: React.FC = () => {
const navigate = useNavigate();

const [step, setStep] = useState<Step>(1);

// Paso 1: código de reserva
const [code, setCode] = useState("");
const [codeError, setCodeError] = useState<string | null>(null);

// Paso 2: datos del pasajero
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [documento, setDocumento] = useState("");
const [email, setEmail] = useState("");
const [extraBag, setExtraBag] = useState<"no" | "yes">("no");
const [passengerError, setPassengerError] = useState<string | null>(null);

// Validación simple de código por ahora
const validateCodeFormat = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Ingresa el código de tu reserva.";
    if (!/^[A-Za-z0-9]{6,10}$/.test(trimmed)) {
    return "El código debe tener entre 6 y 10 caracteres alfanuméricos.";
    }
    return null;
};

const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCodeFormat(code);
    if (error) {
    setCodeError(error);
    return;
    }
    setCodeError(null);

    // 👉 Aquí se integrará el endpoint cuando exista:
    /*
    try {
    const res = await api.post("/checkin/validar-codigo", { codigo: code.trim() });
    // si todo bien:
    setStep(2);
    } catch (err: any) {
    setCodeError(
        err?.response?.data?.message ||
        "No encontramos una reserva con ese código. Verifica e inténtalo de nuevo."
    );
    }
    */

    // 🔹 Mientras no haya backend: avanzar al paso 2
    setStep(2);
};

const handleSubmitPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !documento.trim() || !email.trim()) {
    setPassengerError("Por favor completa todos los campos obligatorios.");
    return;
    }
    setPassengerError(null);

    // Aquí podrías guardar estos datos en contexto o en localStorage
    // para reutilizarlos en SeatMapPage y en el flujo de cobro.

    setStep(3);
};

const stepsConfig = [
    { id: 1, label: "Código de reserva" },
    { id: 2, label: "Datos del pasajero" },
    { id: 3, label: "Instrucciones" },
];

const wantsExtraBag = extraBag === "yes";

return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#050b22] to-[#020617] text-white flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-3xl bg-[#050816]/80 border border-cyan-500/20 rounded-3xl shadow-[0_20px_60px_rgba(15,118,255,0.35)] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-cyan-500/20 bg-gradient-to-r from-[#020617] via-[#050816] to-[#020617]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Check-In en línea
        </h1>
        <p className="mt-2 text-sm text-slate-300">
            Ingresa el código de tu reserva y completa los datos del pasajero
            para continuar con el proceso de check-in.
        </p>
        </div>

        {/* Stepper */}
        <div className="px-6 sm:px-8 pt-4 pb-2 bg-[#020617]/80 border-b border-cyan-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {stepsConfig.map((s, idx) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
                <div key={s.id} className="flex items-center gap-2">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-all ${
                    isActive
                        ? "bg-cyan-500 text-slate-900 border-cyan-300 shadow-md shadow-cyan-500/40"
                        : isDone
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/60"
                        : "bg-slate-800 text-slate-300 border-slate-500/60"
                    }`}
                >
                    {s.id}
                </div>
                <span
                    className={`text-xs sm:text-sm ${
                    isActive
                        ? "text-cyan-300 font-medium"
                        : "text-slate-400"
                    }`}
                >
                    {s.label}
                </span>
                {idx < stepsConfig.length - 1 && (
                    <div className="hidden sm:block w-6 h-px bg-slate-700 mx-1" />
                )}
                </div>
            );
            })}
        </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Paso 1: Código de reserva */}
        {step === 1 && (
            <form onSubmit={handleSubmitCode} className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
                <h2 className="text-lg font-semibold mb-2">
                Paso 1: ingresa el código de tu reserva
                </h2>
                <p className="text-sm text-slate-300 mb-4">
                Encontrarás el código de reserva en el correo de confirmación
                que recibiste al completar tu compra. Suele tener entre{" "}
                <span className="font-semibold text-cyan-300">
                    6 y 10 caracteres
                </span>{" "}
                y puede incluir letras y números (ej:{" "}
                <span className="font-mono text-cyan-300">AB12CD</span>).
                </p>

                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                Código de reserva
                </label>
                <input
                type="text"
                value={code}
                onChange={(e) =>
                    setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                }
                placeholder="Ej: AB12CD"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono tracking-[0.2em]"
                />
                {codeError && (
                <p className="mt-2 text-xs text-red-400">{codeError}</p>
                )}

                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-400">
                <div className="flex-1">
                    <p className="font-semibold text-slate-200 mb-1">
                    ¿Qué debo escribir aquí?
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                    <li>El código exacto tal como aparece en tu correo.</li>
                    <li>Sin espacios ni símbolos adicionales.</li>
                    <li>Respeta mayúsculas y minúsculas si es posible.</li>
                    </ul>
                </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 text-sm font-semibold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/40"
                >
                Continuar con el check-in
                </button>
            </div>
            </form>
        )}

        {/* Paso 2: Datos del pasajero + maleta */}
        {step === 2 && (
            <form onSubmit={handleSubmitPassenger} className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                    Paso 2: datos del pasajero
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-200">
                    Código: <span className="font-mono">{code}</span>
                </span>
                </div>

                <p className="text-sm text-slate-300">
                Completa los datos tal como aparecen en tu documento y en la
                reserva. También podrás añadir opcionalmente una{" "}
                <span className="font-semibold text-cyan-300">
                    maleta adicional
                </span>{" "}
                que tendrá un cargo extra descontado de tu saldo disponible.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Nombre del pasajero
                    </label>
                    <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: Pedro"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Apellido del pasajero
                    </label>
                    <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej: Martínez"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Número de documento
                    </label>
                    <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Cédula / Pasaporte"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Correo electrónico de contacto
                    </label>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                    Usaremos este correo para enviarte confirmaciones y
                    recordatorios del check-in.
                    </p>
                </div>
                </div>

                {/* Maleta adicional */}
                <div className="mt-2 bg-slate-950/60 border border-slate-700/70 rounded-xl p-3 sm:p-4">
                <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Maleta adicional (opcional)
                </p>
                <p className="text-xs text-slate-300 mb-3">
                    Puedes añadir una maleta adicional a tu reserva. Este
                    servicio tiene un costo de{" "}
                    <span className="font-semibold text-emerald-300">
                    ${EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP
                    </span>{" "}
                    que se descontará de tu saldo disponible al momento de
                    confirmar el check-in.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="extraBag"
                        value="no"
                        checked={extraBag === "no"}
                        onChange={() => setExtraBag("no")}
                        className="accent-cyan-400"
                    />
                    <span>No, no deseo añadir maleta adicional</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                    <input
                        type="radio"
                        name="extraBag"
                        value="yes"
                        checked={extraBag === "yes"}
                        onChange={() => setExtraBag("yes")}
                        className="accent-emerald-400"
                    />
                    <span>
                        Sí, deseo añadir una maleta adicional (+{" "}
                        {EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP)
                    </span>
                    </label>
                </div>
                </div>

                {passengerError && (
                <p className="text-xs text-red-400">{passengerError}</p>
                )}

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">
                    ¿Qué debo escribir aquí?
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                    Nombre y apellido tal como aparecen en tu documento de
                    identidad.
                    </li>
                    <li>
                    El número de documento con el que hiciste la compra.
                    </li>
                    <li>
                    Un correo válido al que tengas acceso durante el viaje.
                    </li>
                    <li>
                    Si eliges maleta adicional, asegúrate de tener saldo
                    suficiente en tu monedero.
                    </li>
                </ul>
                </div>
            </div>

            <div className="flex justify-between gap-3">
                <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/80 transition-all"
                >
                ← Volver al código
                </button>
                <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 text-sm font-semibold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/40"
                >
                Ver instrucciones del check-in
                </button>
            </div>
            </form>
        )}

        {/* Paso 3: Instrucciones + resumen + continuar al mapa de asientos */}
        {step === 3 && (
            <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
                <h2 className="text-lg font-semibold">
                Paso 3: instrucciones para completar tu check-in
                </h2>
                <p className="text-sm text-slate-300">
                Ya verificamos tu código de reserva y los datos del pasajero.
                A continuación vas a elegir tu asiento en el mapa del avión.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-1 uppercase tracking-wide">
                    Información de tu check-in
                    </p>
                    <p className="text-xs text-slate-300 space-y-1">
                    <span className="block">
                        Código:{" "}
                        <span className="font-mono text-cyan-300">
                        {code}
                        </span>
                    </span>
                    <span className="block">
                        Pasajero:{" "}
                        <span className="font-semibold">
                        {firstName} {lastName}
                        </span>
                    </span>
                    <span className="block">
                        Documento:{" "}
                        <span className="font-semibold">{documento}</span>
                    </span>
                    <span className="block">
                        Correo:{" "}
                        <span className="font-semibold">{email}</span>
                    </span>
                    </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-1 uppercase tracking-wide">
                    Servicios adicionales
                    </p>
                    <p className="text-xs text-slate-300 space-y-1">
                    <span className="block">
                        Maleta adicional:{" "}
                        <span
                        className={
                            wantsExtraBag
                            ? "text-emerald-300 font-semibold"
                            : "text-slate-200 font-semibold"
                        }
                        >
                        {wantsExtraBag ? "Sí" : "No"}
                        </span>
                    </span>
                    {wantsExtraBag && (
                        <span className="block">
                        Cargo estimado:{" "}
                        <span className="font-semibold text-emerald-300">
                            {EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1">
                            Este valor se descontará de tu saldo disponible al
                            momento de confirmar definitivamente el check-in.
                        </span>
                        </span>
                    )}
                    {!wantsExtraBag && (
                        <span className="block text-[11px] text-slate-400 mt-1">
                        Si cambias de opinión, podrás añadir servicios
                        adicionales antes de finalizar tu proceso.
                        </span>
                    )}
                    </p>
                </div>
                </div>

                <div className="mt-2 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">
                    ¿Qué harás en el mapa de asientos?
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Ver el plano del avión disponible para tu vuelo.</li>
                    <li>Elegir el asiento que prefieras entre los libres.</li>
                    <li>
                    Confirmar tu selección para completar el check-in y aplicar
                    los cargos adicionales (como la maleta).
                    </li>
                </ul>
                </div>
            </div>

            <div className="flex justify-between gap-3">
                <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/80 transition-all"
                >
                ← Volver a datos del pasajero
                </button>
                <button
                type="button"
                onClick={() => navigate("/mapa-asientos")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/40"
                >
                Ir al mapa de asientos
                </button>
            </div>
            </div>
        )}
        </div>
    </div>
    </div>
);
};

export default CheckInPage;
