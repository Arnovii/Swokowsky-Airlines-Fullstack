// frontend/src/modules/checkin/pages/checkin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import checkinService, { type CheckinSessionData } from "../services/checkinService";

type Step = 1 | 2 | 3;

const EXTRA_BAG_PRICE = 80000; // 💼 Precio de la maleta adicional

const CheckInPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Paso 1: código de reserva y DNI
  const [code, setCode] = useState("");
  const [dni, setDni] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  // Paso 2: datos del pasajero (vienen del backend)
  const [ticketData, setTicketData] = useState<CheckinSessionData | null>(null);
  const [extraBag, setExtraBag] = useState<"no" | "yes">("no");

  // Recuperar sesión previa si existe
  useEffect(() => {
    const session = checkinService.getSession();
    if (session) {
      setTicketData(session);
      setCode(session.codigo_unico);
      setExtraBag(session.extraBag ? "yes" : "no");
      // Si ya tiene datos válidos, ir al paso 2 o 3
      if (session.asientoAsignado) {
        setStep(3);
      } else if (session.ticketId) {
        setStep(2);
      }
    }
  }, []);

  // Validación de código
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

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const codeErr = validateCodeFormat(code);
    const dniErr = validateDniFormat(dni);
    
    if (codeErr) {
      setCodeError(codeErr);
      return;
    }
    if (dniErr) {
      setCodeError(dniErr);
      return;
    }
    
    setCodeError(null);
    setLoading(true);

    try {
      // Llamar al endpoint de validación
      const response = await checkinService.validateCode(code.trim(), dni.trim());
      
      // Guardar datos en estado y localStorage
      const sessionData: CheckinSessionData = {
        codigo_unico: code.trim(),
        ticketId: response.ticketId,
        id_vuelo: response.id_vuelo,
        pasajero: response.pasajero,
        asientoComprado: response.asientoComprado,
        asientoAsignado: response.asientoAsignado,
        salida: response.salida,
        extraBag: false,
      };
      
      setTicketData(sessionData);
      checkinService.saveSession(sessionData);
      
      toast.success("✅ Código validado correctamente", { position: "top-center" });
      setStep(2);
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message || "No pudimos validar tu código. Verifica e inténtalo de nuevo.";
      setCodeError(message);
      toast.error(`❌ ${message}`, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar preferencia de maleta extra
    if (ticketData) {
      const updatedData = { ...ticketData, extraBag: extraBag === "yes" };
      setTicketData(updatedData);
      checkinService.saveSession(updatedData);
    }
    
    setStep(3);
  };

  const handleGoToSeatMap = () => {
    if (!ticketData) return;
    
    // Navegar al mapa de asientos con el id del vuelo
    navigate(`/mapa-asientos/${ticketData.id_vuelo}?checkin=true`);
  };

  const stepsConfig = [
    { id: 1, label: "Código de reserva" },
    { id: 2, label: "Verificar datos" },
    { id: 3, label: "Seleccionar asiento" },
  ];

  const wantsExtraBag = extraBag === "yes";

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
            Ingresa el código de tu reserva y tu documento de identidad
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
          {/* Paso 1: Código de reserva + DNI */}
          {step === 1 && (
            <form onSubmit={handleSubmitCode} className="space-y-5">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
                <h2 className="text-lg font-semibold mb-2">
                  Paso 1: Valida tu reserva
                </h2>
                <p className="text-sm text-slate-300 mb-4">
                  Ingresa el código de check-in que recibiste en tu correo de confirmación
                  junto con tu número de documento de identidad.
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
                        setCode(e.target.value.toLowerCase().replace(/\s/g, ""))
                      }
                      placeholder="Ej: a1b2c3d4e5f6"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono tracking-[0.1em] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                      Número de documento (DNI/Cédula/Pasaporte)
                    </label>
                    <input
                      type="text"
                      value={dni}
                      onChange={(e) =>
                        setDni(e.target.value.replace(/\s/g, ""))
                      }
                      placeholder="Ej: 12345678"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 disabled:opacity-50"
                    />
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
                    <li>El check-in solo está disponible 24 horas antes del vuelo.</li>
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

          {/* Paso 2: Verificar datos del pasajero */}
          {step === 2 && ticketData && (
            <form onSubmit={handleSubmitPassenger} className="space-y-5">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold">
                    Paso 2: Verifica tus datos
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200">
                    ✓ Código validado
                  </span>
                </div>

                <p className="text-sm text-slate-300">
                  Verifica que los datos de tu reserva sean correctos. Si hay algún
                  error, contacta con soporte antes de continuar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                      Datos del pasajero
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-400">Nombre:</span>{" "}
                        <span className="font-semibold text-white">{ticketData.pasajero.nombre}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Documento:</span>{" "}
                        <span className="font-semibold text-white">{ticketData.pasajero.dni}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Email:</span>{" "}
                        <span className="font-semibold text-white">{ticketData.pasajero.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                      Datos del vuelo
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-400">Ticket ID:</span>{" "}
                        <span className="font-mono font-semibold text-white">#{ticketData.ticketId}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Salida:</span>{" "}
                        <span className="font-semibold text-white">{formatDate(ticketData.salida)}</span>
                      </p>
                      {ticketData.asientoComprado && (
                        <p>
                          <span className="text-slate-400">Asiento comprado:</span>{" "}
                          <span className="font-mono font-semibold text-emerald-300">{ticketData.asientoComprado}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Maleta adicional */}
                <div className="bg-slate-950/60 border border-slate-700/70 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-2">
                    Maleta adicional (opcional)
                  </p>
                  <p className="text-xs text-slate-300 mb-3">
                    Puedes añadir una maleta adicional a tu reserva. Este
                    servicio tiene un costo de{" "}
                    <span className="font-semibold text-emerald-300">
                      ${EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP
                    </span>{" "}
                    que se descontará de tu saldo disponible.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="extraBag"
                        value="no"
                        checked={extraBag === "no"}
                        onChange={() => setExtraBag("no")}
                        className="accent-cyan-400"
                      />
                      <span>No deseo maleta adicional</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="extraBag"
                        value="yes"
                        checked={extraBag === "yes"}
                        onChange={() => setExtraBag("yes")}
                        className="accent-emerald-400"
                      />
                      <span>
                        Sí, añadir maleta (+{EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    checkinService.clearSession();
                    setTicketData(null);
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

          {/* Paso 3: Instrucciones + ir al mapa de asientos */}
          {step === 3 && ticketData && (
            <div className="space-y-5">
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 space-y-4">
                <h2 className="text-lg font-semibold">
                  Paso 3: Selecciona tu asiento
                </h2>
                <p className="text-sm text-slate-300">
                  Ya verificamos tu reserva. Ahora puedes elegir tu asiento en el
                  mapa del avión.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                      Resumen del check-in
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-slate-400">Pasajero:</span>{" "}
                        <span className="font-semibold">{ticketData.pasajero.nombre}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Documento:</span>{" "}
                        <span className="font-semibold">{ticketData.pasajero.dni}</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Salida:</span>{" "}
                        <span className="font-semibold">{formatDate(ticketData.salida)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">
                      Servicios adicionales
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-slate-400">Maleta adicional:</span>{" "}
                        <span className={wantsExtraBag ? "text-emerald-300 font-semibold" : "font-semibold"}>
                          {wantsExtraBag ? "Sí" : "No"}
                        </span>
                      </p>
                      {wantsExtraBag && (
                        <p className="text-xs text-slate-400">
                          Cargo: {EXTRA_BAG_PRICE.toLocaleString("es-CO")} COP
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-300 mb-2">
                    ⚠️ Importante
                  </p>
                  <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                    <li>Selecciona un asiento disponible en el mapa.</li>
                    <li>Una vez confirmado, no podrás cambiar el asiento.</li>
                    <li>El check-in quedará completado al confirmar tu asiento.</li>
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
                  onClick={handleGoToSeatMap}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/40"
                >
                  Ir al mapa de asientos →
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
