    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
    import api from "../../../api/axios"; // tu instancia Axios configurada

    // Validación de fortaleza de contraseña
    function isStrong(pwd: string) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(pwd);
    }

    export default function ChangePassword() {
    const navigate = useNavigate();

    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isStrong(newPwd)) {
        setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
        return;
        }

        if (newPwd !== confirmPwd) {
        setError("Las contraseñas no coinciden.");
        return;
        }

        setSubmitting(true);

        try {
        // Llamada real al endpoint PATCH
        await api.patch("/profile", {
            password_bash: newPwd,
            must_change_password: false, // ✅ ahora se actualiza a FALSE
        });

        setSuccess(true);

        // Redirigir al panel administrador tras el cambio
        setTimeout(() => navigate("/panelAdministrador", { replace: true }), 1200);
        } catch (err: any) {
        const msg =
            err?.response?.data?.message ||
            "❌ No se pudo actualizar la contraseña. Verifica la conexión o vuelve a intentarlo.";
        setError(msg);
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">
            {/* Encabezado */}
            <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3">
                <FiLock className="text-blue-600" size={20} />
            </div>
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Cambiar contraseña</h1>
                <p className="text-sm text-gray-500">
                Por seguridad, debes actualizar tu contraseña antes de continuar.
                </p>
            </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nueva contraseña */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
            </label>
            <div className="relative">
                <input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value.replace(/\s/g, ""))} // 🚫 elimina espacios
                placeholder="Nueva contraseña segura"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-10 shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
                autoFocus
                />
                <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            {!newPwd ? null : isStrong(newPwd) ? (
                <p className="mt-1 text-xs text-green-600">Contraseña fuerte ✅</p>
            ) : (
                <p className="mt-1 text-xs text-amber-600">
                Requisitos: 8+ caracteres, mayúscula, minúscula, número y símbolo.
                </p>
            )}
            </div>

            {/* Confirmar */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
            </label>
            <div className="relative">
                <input
                type={showConfirm ? "text" : "password"}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value.replace(/\s/g, ""))} // 🚫 elimina espacios
                placeholder="Repite la nueva contraseña"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 pr-10 shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
                />
                <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            {!confirmPwd ? null : confirmPwd === newPwd ? (
                <p className="mt-1 text-xs text-green-600">Coinciden ✅</p>
            ) : (
                <p className="mt-1 text-xs text-rose-600">No coinciden.</p>
            )}
            </div>


            {/* Mensajes */}
            {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>
            )}
            {success && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                ✅ Contraseña actualizada correctamente. Redirigiendo...
                </div>
            )}

            {/* Botón */}
            <button
                type="submit"
                disabled={
                submitting || !newPwd || !confirmPwd || newPwd !== confirmPwd || !isStrong(newPwd)
                }
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white font-medium shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[.99] disabled:opacity-60"
            >
                {submitting ? "Guardando…" : "Guardar y continuar"}
            </button>
            </form>
        </div>
        </div>
    );
    }