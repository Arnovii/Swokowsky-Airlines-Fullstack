    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import api from "../../../api/axios"; // tu instancia Axios configurada

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

    // -------------------------
    // Manejo de envío del formulario
    // -------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validaciones simples
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

        // Petición al backend
        await api.post("/root/admin", form);

        setSuccess("Administrador creado exitosamente.");
        setForm(initialForm);

        // Redirigir al listado root tras un pequeño delay
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
        <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Crear nuevo administrador
            </h1>
            <p className="text-sm text-gray-500 mb-6">
            Completa la información para registrar un nuevo usuario administrador.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
                </label>
                <input
                type="text"
                value={form.nombre}
                onChange={(e) =>
                    setForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Valentina"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                />
            </div>

            {/* Apellido */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
                </label>
                <input
                type="text"
                value={form.apellido}
                onChange={(e) =>
                    setForm((prev) => ({ ...prev, apellido: e.target.value }))
                }
                placeholder="Ej: López"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                />
            </div>

            {/* Correo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
                </label>
                <input
                type="email"
                value={form.correo}
                onChange={(e) =>
                    setForm((prev) => ({ ...prev, correo: e.target.value }))
                }
                placeholder="admin@ejemplo.com"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                />
            </div>

            {/* Username */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
                </label>
                <input
                type="text"
                value={form.username}
                onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="admin123"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                />
            </div>

            {/* Mensajes de error o éxito */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
                </div>
            )}
            {success && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                {success}
                </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-between mt-6">
                <button
                type="button"
                onClick={() => navigate("/panelAdministrador/root")}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                Cancelar
                </button>

                <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
                >
                {loading ? "Creando..." : "Crear administrador"}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    };

    export default CreateAdmin;