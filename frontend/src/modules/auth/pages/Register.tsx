// src/modules/auth/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

// Lista básica de nacionalidades corregida con enum de Prisma
const NATIONALITIES = [
  { label: "Colombia", value: "Colombia" },
  { label: "Argentina", value: "Argentina" },
  { label: "México", value: "Mexico" },
  { label: "España", value: "Spain" },
  { label: "Estados Unidos", value: "UnitedStates" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Perú", value: "Peru" },
  { label: "Chile", value: "Chile" },
  { label: "Brasil", value: "Brazil" },
  { label: "Alemania", value: "Germany" },
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    nacionalidad: "",
    genero: "",
    correo: "",
    username: "",
    password: "",
    confirmPassword: "",
    img_url: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        dni: form.dni,
        nombre: form.nombre,
        apellido: form.apellido,
        fecha_nacimiento: new Date(form.fecha_nacimiento).toISOString(),
        nacionalidad: form.nacionalidad,
        genero: form.genero,
        correo: form.correo,
        username: form.username,
        password_bash: form.password,
        img_url: form.img_url,
      };

      console.log("📦 Enviando al backend:", payload);

      await api.post("/auth/register", payload);

      navigate("/login");
    } catch (err: any) {
      console.error("❌ Error en registro:", err.response?.data || err.message);
      setError(
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(", ")
          : err.response?.data?.message || "Error al registrarse"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500">
            Completa todos los campos para registrarte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">DNI</label>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Nacionalidad</label>
              <select
                name="nacionalidad"
                value={form.nacionalidad}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Seleccionar</option>
                {NATIONALITIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Género</label>
              <select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="X">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Correo</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Imagen (URL)</label>
              <input
                type="url"
                name="img_url"
                value={form.img_url}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">¿Ya tienes cuenta?</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
