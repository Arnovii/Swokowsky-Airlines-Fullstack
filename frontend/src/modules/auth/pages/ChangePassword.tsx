    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
    import api from "../../../api/axios";
    import { useAuth } from "../../../context/AuthContext";

    function isStrong(pwd: string) {
    // Mín 8, una mayúscula, una minúscula, un número y un símbolo
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(pwd);
    }

    export default function ForcePasswordChange() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth() as any; // asumiendo que tu AuthContext expone setUser
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isStrong(newPwd)) {
        setError(
            "La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo."
        );
        return;
        }
        if (newPwd !== confirm) {
        setError("La confirmación no coincide con la nueva contraseña.");
        return;
        }
        try {
        setSubmitting(true);

        // Ajusta la ruta si tu backend usa otro path/DTO
        // Ejemplo esperado backend: POST /auth/change-password { oldPassword, newPassword }
        const { data } = await api.post("/auth/change-password", {
            oldPassword: oldPwd,
            newPassword: newPwd,
        });

        // Si tu backend devuelve un nuevo token tras el cambio:
        if (data?.token) {
            localStorage.setItem("swk_token", data.token);
        }

        // Marca must_change_password en falso y refresca user del contexto/localStorage
        const nextUser = {
            ...(data?.user ?? user ?? {}),
            must_change_password: false,
        };
        localStorage.setItem("swk_user", JSON.stringify(nextUser));
        if (setUser) setUser(nextUser);

        // Redirige al módulo correcto según tipo_usuario
        const tipo = (nextUser?.tipo_usuario || "").toString().toLowerCase();
        if (tipo === "root") {
            navigate("/panelAdministrador/root", { replace: true });
        } else if (tipo === "admin") {
            navigate("/panelAdministrador", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
        } catch (err: any) {
        setError(err?.response?.data?.message || "No se pudo cambiar la contraseña.");
        } finally {
        setSubmitting(false);
        }
    }

    return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3">
                <FiLock className="text-blue-600" size={20} />
            </div>
            <div>
                <h1 className="text-xl font-semibold text-slate-900">
                Cambia tu contraseña
                </h1>
                <p className="text-sm text-slate-500">
                Por seguridad, debes actualizar tu contraseña para continuar.
                </p>
            </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contraseña actual */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña actual
                </label>
                <div className="relative">
                <input
                    type={showOld ? "text" : "password"}
                    value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                    placeholder="Contraseña temporal"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-10 shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    required
                    autoFocus
                />
                <button
                    type="button"
                    onClick={() => setShowOld((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    {showOld ? <FiEyeOff /> : <FiEye />}
                </button>
                </div>
            </div>

            {/* Nueva contraseña */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Nueva contraseña
                </label>
                <div className="relative">
                <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Nueva contraseña segura"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-10 shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
                </div>
                {/* sugerencia de fuerza */}
                {!newPwd ? null : isStrong(newPwd) ? (
                <p className="mt-1 text-xs text-green-600">Contraseña fuerte ✅</p>
                ) : (
                <p className="mt-1 text-xs text-amber-600">
                    Requisitos: 8+ caracteres, mayúscula, minúscula, número y símbolo.
                </p>
                )}
            </div>

            {/* Confirmación */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar nueva contraseña
                </label>
                <div className="relative">
                <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-10 shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
                </div>
                {!confirm ? null : confirm === newPwd ? (
                <p className="mt-1 text-xs text-green-600">Coinciden ✅</p>
                ) : (
                <p className="mt-1 text-xs text-rose-600">No coinciden.</p>
                )}
            </div>

            {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                {error}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white font-medium shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[.99] disabled:opacity-60"
            >
                {submitting ? "Guardando…" : "Guardar y continuar"}
            </button>
            </form>
        </div>
        </div>
    );
    }
