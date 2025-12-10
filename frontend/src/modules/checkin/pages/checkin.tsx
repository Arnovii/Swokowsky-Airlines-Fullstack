import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import checkinService, { type CheckinSessionData } from "../services/checkinService";
import SeatMapModal from "../../seatmap/components/SeatMapModal";

type Step = 1 | 2 | 3;

const EXTRA_BAG_PRICE = 80000; // 💼 Precio de la maleta adicional
const MAX_PASSENGERS = 5;

interface PassengerFormRow {
id: number;
dni: string;
}

interface PassengerSession extends CheckinSessionData {
    extraBag: boolean;
    selectedSeat?: string | null;
    ciudadOrigen?: string;
    ciudadDestino?: string;
    hasChangedSeat?: boolean;
}

// Estado del modal de mapa de asientos
interface SeatModalState {
isOpen: boolean;
passengerIndex: number | null;
}

const CheckInPage: React.FC = () => {
const navigate = useNavigate();

const [step, setStep] = useState<Step>(1);
const [loading, setLoading] = useState(false);

// Paso 1: código de reserva
const [code, setCode] = useState("");
const [codeError, setCodeError] = useState<string | null>(null);

// DNIs de los pasajeros para validar
const [passengerForms, setPassengerForms] = useState<PassengerFormRow[]>([
{ id: 1, dni: "" },
]);

// Datos devueltos por el backend por pasajero
const [passengerSessions, setPassengerSessions] = useState<PassengerSession[]>([]);

// Estado del modal de mapa de asientos
const [seatModal, setSeatModal] = useState<SeatModalState>({
isOpen: false,
passengerIndex: null,
});

// --- Helpers de validación ---

const validateCodeFormat = (value: string) => {
const trimmed = value.trim();
if (!trimmed) return "Ingresa el código de tu reserva.";
if (trimmed.length < 6 || trimmed.length > 20) {
    return "El código debe tener entre 6 y 20 caracteres.";
}
return null;
};

const validateDniFormat = (value: string) => {
const trimmed = value.trim();
if (!trimmed) return "Ingresa tu número de documento.";
if (!/^[A-Za-z0-9]{5,20}$/.test(trimmed)) {
    return "El documento debe tener entre 5 y 20 caracteres alfanuméricos.";
}
return null;
};

// --- Paso 1: añadir / quitar pasajeros ---

const handleChangePassengerDni = (id: number, value: string) => {
setPassengerForms((prev) =>
    prev.map((p) =>
    p.id === id ? { ...p, dni: value.replace(/\s/g, "") } : p
    )
);
};

const handleAddPassenger = () => {
if (passengerForms.length >= MAX_PASSENGERS) return;
const nextId = passengerForms.length
    ? Math.max(...passengerForms.map((p) => p.id)) + 1
    : 1;
setPassengerForms((prev) => [...prev, { id: nextId, dni: "" }]);
};

const handleRemovePassenger = (id: number) => {
if (passengerForms.length === 1) return; // siempre al menos 1
setPassengerForms((prev) => prev.filter((p) => p.id !== id));
};

// --- Paso 1: submit para validar TODOS los pasajeros ---

const handleSubmitCode = async (e: React.FormEvent) => {
e.preventDefault();

const trimmedCode = code.trim().toUpperCase(); // Convertir a mayúsculas para coincidir con el backend
const codeErr = validateCodeFormat(trimmedCode);
if (codeErr) {
    setCodeError(codeErr);
    return;
}

// Validar cada DNI
for (let i = 0; i < passengerForms.length; i++) {
    const dni = passengerForms[i].dni;
    const dniErr = validateDniFormat(dni);
    if (dniErr) {
    setCodeError(`Pasajero ${i + 1}: ${dniErr}`);
    return;
    }
}

setCodeError(null);
setLoading(true);

try {
    // Llamar al endpoint de validación para cada pasajero
    const responses = await Promise.all(
    passengerForms.map((p) =>
        checkinService.validateCode(trimmedCode, p.dni.trim())
    )
    );

    const sessions: PassengerSession[] = responses.map((response) => ({
    codigo_unico: trimmedCode,
    ticketId: response.ticketId,
    id_vuelo: response.id_vuelo,
    pasajero: response.pasajero,
    asientoComprado: response.asientoComprado,
    asientoAsignado: response.asientoAsignado,
    salida: response.salida,
    extraBag: false,
    clase: response.clase,
    ciudadOrigen: response.ciudadOrigen,
    ciudadDestino: response.ciudadDestino,
    selectedSeat: response.asientoAsignado || response.asientoComprado,
    hasChangedSeat: false,
    }));

    setPassengerSessions(sessions);

    toast.success("✅ Todos los pasajeros fueron validados correctamente", {
    position: "top-center",
    });

    setStep(2);
} catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    const message =
    error?.response?.data?.message ||
    "No pudimos validar la reserva. Verifica los datos e inténtalo de nuevo.";
    setCodeError(message);
    toast.error(`❌ ${message}`, { position: "top-center" });
} finally {
    setLoading(false);
}
};

// --- Paso 2: maleta adicional por pasajero ---

const handleExtraBagChange = (index: number, value: "yes" | "no") => {
setPassengerSessions((prev) =>
    prev.map((p, i) =>
    i === index ? { ...p, extraBag: value === "yes" } : p
    )
);
};

const handleSubmitPassenger = (e: React.FormEvent) => {
e.preventDefault();
// Aquí podrías guardar en localStorage o en un servicio si quieres
setStep(3);
};

// --- Paso 3: abrir modal de mapa de asientos POR PASAJERO ---

const handleOpenSeatModal = (index: number) => {
setSeatModal({
isOpen: true,
passengerIndex: index,
});
};

const handleCloseSeatModal = () => {
setSeatModal({
isOpen: false,
passengerIndex: null,
});
};

// Cuando el pasajero confirma un asiento en el modal
const handleSeatConfirmed = (seatId: string) => {
  if (seatModal.passengerIndex === null) return;

  const index = seatModal.passengerIndex;
  const currentPassenger = passengerSessions[index];

  const otherPassengerWithSameSeat = passengerSessions.find(
    (p, i) => i !== index && p.selectedSeat === seatId
  );

  if (otherPassengerWithSameSeat) {
    toast.error(`❌ El asiento ${seatId} ya fue seleccionado por ${otherPassengerWithSameSeat.pasajero.nombre}`, {
      position: 'top-center',
    });
    return;
  }

  const originalSeat = currentPassenger.asientoAsignado || currentPassenger.asientoComprado;
  const seatChanged = seatId !== originalSeat;

  setPassengerSessions((prev) =>
    prev.map((p, i) =>
      i === index ? { 
        ...p, 
        selectedSeat: seatId,
        hasChangedSeat: seatChanged ? true : p.hasChangedSeat
      } : p
    )
  );

  if (seatChanged) {
    toast.success(`✅ Asiento cambiado a ${seatId}. No podrás cambiarlo nuevamente.`, {
      position: 'top-center',
    });
  }
};

// Confirmar check-in final para todos los pasajeros
const [confirmingAll, setConfirmingAll] = useState(false);

const handleConfirmAllCheckins = async () => {
// Verificar que todos tienen asiento seleccionado
const missingSeats = passengerSessions.filter((p) => !p.selectedSeat);
if (missingSeats.length > 0) {
toast.warning(`⚠️ Faltan ${missingSeats.length} pasajero(s) por seleccionar asiento`, {
    position: 'top-center',
});
return;
}

setConfirmingAll(true);

try {
// Procesar check-in para cada pasajero
for (let i = 0; i < passengerSessions.length; i++) {
    const passenger = passengerSessions[i];
    
    // Asignar asiento
    await checkinService.assignSeat(
    passenger.codigo_unico,
    passenger.ticketId,
    passenger.selectedSeat!
    );
    
    // Confirmar check-in
    await checkinService.confirmCheckin(
    passenger.codigo_unico,
    passenger.ticketId
    );
    
    toast.success(`✅ Check-in completado para ${passenger.pasajero.nombre}`, {
    position: 'top-center',
    autoClose: 2000,
    });
}

// Navegar a la página de confirmación con los datos del primer pasajero
// (o podrías crear una página de confirmación grupal)
const firstPassenger = passengerSessions[0];

// Obtener datos completos del último check-in para la página de confirmación
const result = await checkinService.confirmCheckin(
    firstPassenger.codigo_unico,
    firstPassenger.ticketId
).catch(() => null);

toast.success('🎉 ¡Check-in grupal completado exitosamente!', {
    position: 'top-center',
    autoClose: 3000,
});

// Navegar a confirmación
navigate('/checkin/confirmacion', {
    state: {
    checkinCompleted: true,
    ticketId: firstPassenger.ticketId,
    asiento: firstPassenger.selectedSeat,
    pasajero: firstPassenger.pasajero,
    vuelo: result?.vuelo,
    codigoReserva: result?.codigoReserva,
    totalPassengers: passengerSessions.length,
    allSeats: passengerSessions.map(p => ({
        nombre: p.pasajero.nombre,
        asiento: p.selectedSeat,
        dni: p.pasajero.dni,
        ticketId: p.ticketId,
    })),
    },
    replace: true,
});

} catch (err: unknown) {
console.error('Error en check-in grupal:', err);
const error = err as { response?: { data?: { message?: string } } };
const message = error?.response?.data?.message || 'Error al confirmar el check-in';
toast.error(`❌ ${message}`, { position: 'top-center' });
} finally {
setConfirmingAll(false);
}
};

const stepsConfig = [
{ id: 1, label: "Código de reserva" },
{ id: 2, label: "Verificar datos" },
{ id: 3, label: "Seleccionar asiento" },
];

const totalExtraBags = passengerSessions.filter((p) => p.extraBag).length;
const totalExtraCost = totalExtraBags * EXTRA_BAG_PRICE;
const hasGroup = passengerSessions.length > 1;

// Formatear fecha de salida
const formatDate = (dateStr: string) => {
const date = new Date(dateStr);
return date.toLocaleString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
};

return (
<div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#050b22] to-[#020617] text-white flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-3xl bg-[#050816]/80 border border-cyan-500/20 rounded-3xl shadow-[0_20px_60px_rgba(15,118,255,0.35)] overflow-hidden">
    {/* Header */}
    <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-cyan-500/20 bg-gradient-to-r from-[#020617] via-[#050816] to-[#020617]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Check-In en línea
        </h1>
        <p className="mt-2 text-sm text-slate-300">
        Ingresa el código de tu reserva y los documentos de identidad de
        los pasajeros para continuar con el proceso de check-in.
        </p>

        {/* Información del vuelo (común para todos) */}
{passengerSessions[0] && (
  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-2">
      ✈️ Información del vuelo
    </p>
    <div className="flex items-center gap-2 text-sm">
      <span className="font-bold text-white">{passengerSessions[0].ciudadOrigen}</span>
      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <span className="font-bold text-white">{passengerSessions[0].ciudadDestino}</span>
    </div>
    <p className="text-xs text-slate-300 mt-2">
      <span className="text-slate-400">Salida:</span>{" "}
      <span className="font-semibold">{formatDate(passengerSessions[0].salida)}</span>
    </p>
  </div>
)}
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
                {isDone ? "✓" : s.id}
                </div>
                <span
                className={`text-xs sm:text-sm ${
                    isActive
                    ? "text-cyan-300 font-medium"
                    : isDone
                    ? "text-emerald-300"
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
        {/* Paso 1: Código de reserva + DNIs (grupal) */}
        {step === 1 && (
        <form onSubmit={handleSubmitCode} className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
            <h2 className="text-lg font-semibold mb-2">
                Paso 1: Valida tu reserva
            </h2>
            <p className="text-sm text-slate-300 mb-4">
                Ingresa el código de check-in que recibiste en tu correo de
                confirmación y los documentos de identidad de los pasajeros.
            </p>

            <div className="space-y-4">
                <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Código de check-in
                </label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                    setCode(
                        e.target.value.toLowerCase().replace(/\s/g, "")
                    )
                    }
                    placeholder="Ej: a1b2c3d4e5f6"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono tracking-[0.1em] disabled:opacity-50"
                />
                </div>

                {/* Lista de pasajeros */}
                <div className="space-y-3">
                {passengerForms.map((p, idx) => (
                    <div
                    key={p.id}
                    className="flex flex-col sm:flex-row gap-2 sm:items-center"
                    >
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-1">
                        Documento pasajero {idx + 1}
                        </label>
                        <input
                        type="text"
                        value={p.dni}
                        onChange={(e) =>
                            handleChangePassengerDni(p.id, e.target.value)
                        }
                        placeholder="Ej: 12345678"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 disabled:opacity-50"
                        />
                    </div>

                    {passengerForms.length > 1 && (
                        <button
                        type="button"
                        onClick={() => handleRemovePassenger(p.id)}
                        disabled={loading}
                        className="sm:self-end px-3 py-2 text-xs rounded-xl border border-red-500/60 text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                        Quitar
                        </button>
                    )}
                    </div>
                ))}

                <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-400">
                    Puedes hacer check-in grupal para hasta{" "}
                    <span className="font-semibold">
                        {MAX_PASSENGERS} pasajeros
                    </span>{" "}
                    con esta reserva.
                    </p>
                    <button
                    type="button"
                    onClick={handleAddPassenger}
                    disabled={
                        loading || passengerForms.length >= MAX_PASSENGERS
                    }
                    className="text-xs px-3 py-2 rounded-xl border border-cyan-500/60 text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
                    >
                    + Añadir pasajero
                    </button>
                </div>
                </div>
            </div>

            {codeError && (
                <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                ⚠️ {codeError}
                </p>
            )}

            <div className="mt-4 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">
                ¿Dónde encuentro el código?
                </p>
                <ul className="list-disc list-inside space-y-1">
                <li>En el correo de confirmación de tu compra.</li>
                <li>El código tiene 12 caracteres alfanuméricos.</li>
                <li>
                    El check-in solo está disponible 24 horas antes del vuelo.
                </li>
                </ul>
            </div>
            </div>

            <div className="flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 text-sm font-semibold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                <>
                    <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                    </svg>
                    Validando...
                </>
                ) : (
                "Validar y continuar"
                )}
            </button>
            </div>
        </form>
        )}

        {/* Paso 2: Verificar datos de TODOS los pasajeros */}
        {step === 2 && passengerSessions.length > 0 && (
        <form onSubmit={handleSubmitPassenger} className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-lg font-semibold">
                Paso 2: Verifica los datos de los pasajeros
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200">
                ✓ Reserva validada
                </span>
            </div>

            <p className="text-sm text-slate-300">
                Revisa que los datos de cada pasajero sean correctos. Si hay
                algún error, contacta con soporte antes de continuar.
            </p>

            {/* Información del vuelo (común para todos) */}
                {passengerSessions[0] && (
                    <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-2">
                        ✈️ Información del vuelo
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-white">{passengerSessions[0].ciudadOrigen}</span>
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="font-bold text-white">{passengerSessions[0].ciudadDestino}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                        <span className="text-slate-400">Salida:</span>{" "}
                        <span className="font-semibold">{formatDate(passengerSessions[0].salida)}</span>
                    </p>
                    </div>
                )}

            {/* Cards por pasajero */}
            <div className="space-y-4">
                {passengerSessions.map((p, index) => (
                <div
                    key={p.ticketId}
                    className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4 space-y-3"
                >
                    <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                        Pasajero {index + 1}
                    </p>
                    <span className="text-[11px] text-slate-400">
                        Ticket #{p.ticketId}
                    </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                        <p>
                        <span className="text-slate-400">Nombre:</span>{" "}
                        <span className="font-semibold text-white">
                            {p.pasajero.nombre}
                        </span>
                        </p>
                        <p>
                        <span className="text-slate-400">Documento:</span>{" "}
                        <span className="font-semibold text-white">
                            {p.pasajero.dni}
                        </span>
                        </p>
                        <p>
                        <span className="text-slate-400">Email:</span>{" "}
                        <span className="font-semibold text-white">
                            {p.pasajero.email}
                        </span>
                        </p>
                    </div>

                    <div>
                        <p>
                        <span className="text-slate-400">Salida:</span>{" "}
                        <span className="font-semibold text-white">
                            {formatDate(p.salida)}
                        </span>
                        </p>
                        {p.asientoComprado && (
                        <p>
                            <span className="text-slate-400">
                            Asiento comprado:
                            </span>{" "}
                            <span className="font-mono font-semibold text-emerald-300">
                            {p.asientoComprado}
                            </span>
                        </p>
                        )}
                    </div>
                    </div>

                    {/* Maleta adicional por pasajero */}
                    <div className="bg-slate-950/60 border border-slate-700/70 rounded-xl p-3 mt-1">
                    <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-wide mb-2">
                        Maleta adicional (opcional)
                    </p>
                    <p className="text-[11px] text-slate-300 mb-3">
                        Puedes añadir una maleta adicional para este
                        pasajero. Tiene un costo de{" "}
                        <span className="font-semibold text-emerald-300">
                        {EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP
                        </span>{" "}
                        que se descontará de tu saldo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="radio"
                            name={`extraBag-${index}`}
                            value="no"
                            checked={!p.extraBag}
                            onChange={() =>
                            handleExtraBagChange(index, "no")
                            }
                            className="accent-cyan-400"
                        />
                        <span>No deseo maleta adicional</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="radio"
                            name={`extraBag-${index}`}
                            value="yes"
                            checked={p.extraBag}
                            onChange={() =>
                            handleExtraBagChange(index, "yes")
                            }
                            className="accent-emerald-400"
                        />
                        <span>
                            Sí, añadir maleta (
                            {EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP)
                        </span>
                        </label>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>

            <div className="flex justify-between gap-3">
            <button
                type="button"
                onClick={() => {
                setPassengerSessions([]);
                setStep(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/80 transition-all"
            >
                ← Usar otro código
            </button>
            <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 text-sm font-semibold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/40"
            >
                Continuar
            </button>
            </div>
        </form>
        )}

        {/* Paso 3: Instrucciones + selección de asiento POR PASAJERO */}
        {step === 3 && passengerSessions.length > 0 && (
        <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
            <h2 className="text-lg font-semibold">
                Paso 3: Confirma o cambia los asientos
            </h2>
            <p className="text-sm text-slate-300">
                Ya verificamos tu reserva. Cada pasajero tiene un asiento asignado.
                Puedes <strong className="text-cyan-300">mantenerlo</strong> o <strong className="text-cyan-300">cambiarlo</strong> si lo deseas.
                Cuando estés listo, presiona el botón para confirmar el check-in.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                    Resumen del check-in
                </p>
                <div className="space-y-1 text-sm">
                    <p>
                    <span className="text-slate-400">Primer pasajero:</span>{" "}
                    <span className="font-semibold">
                        {passengerSessions[0].pasajero.nombre}
                    </span>
                    </p>
                    {hasGroup && (
                    <p className="text-xs text-slate-400">
                        + {passengerSessions.length - 1} pasajero(s)
                        adicional(es)
                    </p>
                    )}
                    <p>
                    <span className="text-slate-400">Salida:</span>{" "}
                    <span className="font-semibold">
                        {formatDate(passengerSessions[0].salida)}
                    </span>
                    </p>
                </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                    Servicios adicionales
                </p>
                <div className="space-y-1 text-sm">
                    <p>
                    <span className="text-slate-400">
                        Pasajeros con maleta adicional:
                    </span>{" "}
                    <span className="font-semibold">
                        {totalExtraBags} de {passengerSessions.length}
                    </span>
                    </p>
                    {totalExtraBags > 0 && (
                    <p className="text-xs text-slate-400">
                        Cargo total:{" "}
                        {totalExtraCost.toLocaleString("es-CO")} COP
                    </p>
                    )}
                </div>
                </div>
            </div>

            {/* Lista de pasajeros para seleccionar asiento */}
            <div className="mt-4 space-y-3">
                {passengerSessions.map((p, index) => {
                const seatWasChanged = p.selectedSeat && p.selectedSeat !== p.asientoAsignado;
                const canChangeAgain = !p.hasChangedSeat;
                return (
                <div
                    key={p.ticketId}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl px-4 py-3 ${
                    p.selectedSeat 
                        ? 'bg-emerald-950/40 border border-emerald-500/40' 
                        : 'bg-slate-950/60 border border-slate-700/60'
                    }`}
                >
                    <div>
                    <p className="text-sm font-semibold text-white">
                        Pasajero {index + 1}: {p.pasajero.nombre}
                    </p>
                    <p className="text-xs text-slate-400">
                        Documento: {p.pasajero.dni}
                    </p>
                    {p.selectedSeat ? (
                        <p className="text-xs text-emerald-300 font-semibold">
                ✓ Asiento: <span className="text-emerald-200 font-mono text-sm">{p.selectedSeat}</span>
                {seatWasChanged && <span className="text-amber-300 ml-2">(cambiado desde {p.asientoAsignado})</span>}
                        </p>
                    ) : (
                    <p className="text-xs text-slate-500">Sin asiento seleccionado</p>
                )}
                {!canChangeAgain && (
                    <p className="text-xs text-red-400 mt-1">
                    🔒 Ya no puedes cambiar este asiento
                    </p>
                    )}
                    </div>
                    <button
                    type="button"
                    onClick={() => handleOpenSeatModal(index)}
                    disabled={!canChangeAgain}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md bg-slate-600 text-white hover:bg-slate-500 shadow-slate-500/30"
                    >
                    {canChangeAgain ? 'Cambiar asiento' : 'Asiento bloqueado'}
                    </button>
                </div>
                );
                })}
            </div>

            {/* Progreso de selección */}
            <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    ✓ Asientos listos
                </p>
                <p className="text-sm font-semibold">
                    <span className="text-emerald-400">
                    {passengerSessions.length}
                    </span>
                    <span className="text-slate-400"> / {passengerSessions.length} pasajeros</span>
                </p>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                    className="h-2 rounded-full transition-all duration-300 bg-emerald-500"
                    style={{ width: '100%' }}
                ></div>
                </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 mt-4">
            <p className="text-xs font-semibold text-cyan-300 mb-2">
                ℹ️ Información importante
            </p>
            <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li>Cada pasajero ya tiene un asiento asignado. <strong className="text-cyan-300">No es obligatorio cambiarlo.</strong></li>
                <li><strong className="text-amber-300">Solo puedes cambiar el asiento UNA VEZ por pasajero.</strong> Elige con cuidado.</li>
                <li>Cuando estés listo, presiona el botón para confirmar el check-in.</li>
            </ul>
            </div>
            </div>

            <div className="flex justify-between gap-3">
            <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-200 hover:bg-slate-800/80 transition-all"
            >
                ← Volver
            </button>
            <button
                type="button"
                onClick={handleConfirmAllCheckins}
                disabled={confirmingAll || passengerSessions.some(p => !p.selectedSeat)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {confirmingAll ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando check-in...
                </>
                ) : (
                `Confirmar check-in (${passengerSessions.length} pasajero${passengerSessions.length > 1 ? 's' : ''})`
                )}
            </button>
            </div>
        </div>
        )}
    </div>

    {/* Modal del mapa de asientos */}
    {seatModal.passengerIndex !== null && (
    <SeatMapModal
        isOpen={seatModal.isOpen}
        onClose={handleCloseSeatModal}
        idVuelo={passengerSessions[seatModal.passengerIndex]?.id_vuelo}
        passengerName={passengerSessions[seatModal.passengerIndex]?.pasajero.nombre || ''}
        passengerIndex={seatModal.passengerIndex}
        currentAssignedSeat={passengerSessions[seatModal.passengerIndex]?.selectedSeat || passengerSessions[seatModal.passengerIndex]?.asientoAsignado}
        onSeatConfirmed={handleSeatConfirmed}
        ticketClass={passengerSessions[seatModal.passengerIndex]?.clase || 'economica'}
        alreadySelectedSeats={
        passengerSessions
            .filter((_, i) => i !== seatModal.passengerIndex)
            .map((p) => p.selectedSeat)
            .filter((seat): seat is string => seat !== null && seat !== undefined)
        }
    />
    )}
    </div>
</div>
);
};

export default CheckInPage;