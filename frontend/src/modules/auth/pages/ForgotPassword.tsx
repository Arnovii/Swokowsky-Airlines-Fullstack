// src/modules/auth/pages/ForgotPassword.tsx
import React, { useState } from "react";
import api from "../../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setLoading(true);
      // ✅ llamada correcta a la API con axios
      await api.post("/auth/forgot-password", { email });

      // el backend puede o no devolver datos, así que damos un mensaje estándar
      setMessage(
        "✅ Si el correo existe en nuestra base de datos, recibirás un enlace de recuperación."
      );
    } catch (err: any) {
      console.error("❌ Error en forgot-password:", err.response?.data || err.message);
      setMessage(
        err.response?.data?.message || "❌ No se pudo procesar la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Recuperar contraseña</h2>

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
            <label className="block text-sm font-medium">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@dominio.com"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      </div>
    </div>
  );
}
