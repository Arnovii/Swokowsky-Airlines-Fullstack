// src/modules/auth/pages/ResetPassword.tsx
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // token viene en la URL

    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
        setMessage("❌ La contraseña debe tener al menos 8 caracteres");
        return;
    }
    if (newPassword !== confirmPassword) {
        setMessage("❌ Las contraseñas no coinciden");
        return;
    }
    if (!token) {
        setMessage("❌ Token inválido o expirado");
        return;
    }

    try {
        setLoading(true);
        await api.post("/auth/reset-password", {
        token,
        newPassword,
        });

        setMessage("✅ Contraseña restablecida con éxito. Redirigiendo...");
        setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
        console.error("❌ Error en reset:", err.response?.data || err.message);
        setMessage(
        err.response?.data?.message || "No se pudo restablecer la contraseña"
        );
    } finally {
        setLoading(false);
    }
    };

    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
            Restablecer contraseña
        </h2>

        {message && (
            <div
            className={`mb-4 p-2 rounded-md text-center ${
                message.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            >
            {message}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium">Nueva contraseña</label>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
            />
            </div>

            <div>
            <label className="block text-sm font-medium">
                Confirmar contraseña
            </label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border rounded-md"
            />
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
            {loading ? "Procesando..." : "Restablecer contraseña"}
            </button>
        </form>
        </div>
    </div>
    );
}
