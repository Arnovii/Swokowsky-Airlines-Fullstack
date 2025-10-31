    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import api from "../../../api/axios";

    type NewAdmin = {
    nombre: string;
    apellido: string;
    correo: string;
    username: string;
    };

    const initialForm: NewAdmin = {
    nombre: "",
    apellido: "",
    correo: "",
    username: "",
    };

    function isEmailValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const CreateAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<NewAdmin>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.nombre.trim() || !form.apellido.trim() || !form.username.trim()) {
        setError("Todos los campos son obligatorios.");
        return;
        }

        if (!isEmailValid(form.correo)) {
        setError("Por favor ingresa un correo válido.");
        return;
        }

        try {
        setLoading(true);
        await api.post("/root/admin", form);
        setSuccess("Administrador creado exitosamente.");
        setForm(initialForm);
        setTimeout(() => navigate("/panelAdministrador/root"), 1500);
        } catch (err: any) {
        const msg =
            err?.response?.data?.message ||
            "Error al crear el administrador. Inténtalo nuevamente.";
        setError(msg);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        </div>

        {/* Card principal */}
        <div className="relative w-full max-w-lg">
            {/* Efecto glow detrás del card */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 pb-12">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Nuevo Administrador</h1>
                </div>
                </div>
                <p className="text-blue-100/80 text-sm">Completa los datos para crear un usuario administrador</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
                {/* Grid de 2 columnas para nombre y apellido */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nombre
                    </label>
                    <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    placeholder="Valentina"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition duration-200"
                    required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Apellido
                    </label>
                    <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, apellido: e.target.value }))
                    }
                    placeholder="López"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition duration-200"
                    required
                    />
                </div>
                </div>

                {/* Correo */}
                <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Correo electrónico
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    </div>
                    <input
                    type="email"
                    value={form.correo}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, correo: e.target.value }))
                    }
                    placeholder="admin@ejemplo.com"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition duration-200"
                    required
                    />
                </div>
                </div>

                {/* Username */}
                <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nombre de usuario
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    </div>
                    <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                        setForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                    placeholder="admin123"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition duration-200"
                    required
                    />
                </div>
                </div>

                {/* Mensajes */}
                {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-300">{error}</span>
                </div>
                )}
                
                {success && (
                <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-emerald-300">{success}</span>
                </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => navigate("/panelAdministrador/root")}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700/50 transition duration-200"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-700 hover:to-cyan-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                >
                    {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando...
                    </span>
                    ) : (
                    "Crear administrador"
                    )}
                </button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
    };

    export default CreateAdmin;