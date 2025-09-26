// src/modules/auth/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

// Lista de nacionalidades (puedes ampliarla)
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

type FieldErrors = Partial<{
  dni: string;
  correo: string;
  username: string;
  password: string;
  confirmPassword: string;
  img_url: string;
  general: string;
}>;

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

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    // limpiar error del campo editado
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validateClient = (): FieldErrors => {
    const e: FieldErrors = {};

    // DNI: 8-20
    if (form.dni.length < 8 || form.dni.length > 20) {
      e.dni = "El DNI debe tener entre 8 y 20 caracteres.";
    }

    // Username: 6-20 (más de 5 como pediste)
    if (form.username.length < 6 || form.username.length > 20) {
      e.username = "El nombre de usuario debe tener entre 6 y 20 caracteres.";
    }

    // Email formato
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = "El correo no es válido.";
    }

    // Password >= 8
    if (form.password.length < 8) {
      e.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    // Confirm igual a password
    if (form.confirmPassword !== form.password) {
      e.confirmPassword = "Las contraseñas no coinciden.";
    }

    // Imagen: extensión simple (ajusta si usas upload real)
    if (!/\.(jpg|jpeg|png|gif)$/i.test(form.img_url)) {
      e.img_url = "La imagen debe ser .jpg, .jpeg, .png o .gif";
    }

    return e;
  };

  // ⚠️ PRE-CHECK OPCIONAL (solo si tu backend expone endpoints de disponibilidad)
  // Si no existen, esto no bloquea ni rompe: se ignora el fallo.
  const precheckDuplicates = async (): Promise<FieldErrors> => {
    const e: FieldErrors = {};
    try {
      // Intenta alguna ruta de disponibilidad si existe en tu backend:
      // Ejemplos posibles (ajústalos si existen):
      // const [dniRes, emailRes, userRes] = await Promise.all([
      //   api.get("/users/check-dni", { params: { dni: form.dni } }),
      //   api.get("/users/check-email", { params: { email: form.correo } }),
      //   api.get("/users/check-username", { params: { username: form.username } }),
      // ]);
      // if (dniRes.data?.exists) e.dni = "Ese DNI ya está registrado.";
      // if (emailRes.data?.exists) e.correo = "Ese correo ya está registrado.";
      // if (userRes.data?.exists) e.username = "Ese nombre de usuario ya está en uso.";
    } catch {
      // Si 404/No existe endpoint, no hacemos nada: el backend lo validará en el POST.
    }
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors({});
    setLoading(true);

    // Validación en el cliente
    const clientErr = validateClient();
    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      setLoading(false);
      return;
    }

    // Pre-check opcional (si endpoints existen)
    const dupErr = await precheckDuplicates();
    if (Object.keys(dupErr).length) {
      setErrors(dupErr);
      setLoading(false);
      return;
    }

    // Payload para backend
    const payload = {
      dni: form.dni,
      nombre: form.nombre,
      apellido: form.apellido,
      // si tu backend espera fecha sin hora: new Date(...).toISOString().split("T")[0]
      fecha_nacimiento: new Date(form.fecha_nacimiento).toISOString(),
      nacionalidad: form.nacionalidad,
      genero: form.genero, // "M" | "F" | "X"
      correo: form.correo,
      username: form.username,
      password_bash: form.password,
      img_url: form.img_url,
    };

    try {
      const res = await api.post("/auth/register", payload);

      if (res.status === 201 || res.status === 200) {
        // éxito
        navigate("/login");
        return;
      }

      // Si no es 2xx, mostrar genérico
      setErrors({ general: "No se pudo crear el usuario." });
    } catch (err: any) {
      // ---- Manejo de duplicados por respuesta del backend ----
      // Prisma suele mandar:
      // { code: 'P2002', meta: { target: ['correo'] } }
      const data = err?.response?.data;
      const msg: string | undefined = data?.message;
      const code: string | undefined = data?.code;
      const target: string[] | string | undefined = data?.meta?.target;

      const e: FieldErrors = {};

      // Si es P2002 (unique constraint)
      if (code === "P2002" || /unique constraint/i.test(msg || "")) {
        const targets = Array.isArray(target)
          ? target
          : typeof target === "string"
          ? [target]
          : [];

        // Intenta detectar cuál campo chocó
        const text = (msg || "").toLowerCase();

        const mark = (field: keyof FieldErrors, label: string) => {
          if (!e[field]) e[field] = `${label} ya está registrado.`;
        };

        if (targets.length) {
          targets.forEach((t) => {
            const k = t.toLowerCase();
            if (k.includes("dni")) mark("dni", "El DNI");
            if (k.includes("correo") || k.includes("email")) mark("correo", "El correo");
            if (k.includes("username") || k.includes("usuario")) mark("username", "El nombre de usuario");
          });
        } else {
          // Fallback: inspecciona el mensaje
          if (text.includes("dni")) mark("dni", "El DNI");
          if (text.includes("correo") || text.includes("email")) mark("correo", "El correo");
          if (text.includes("username") || text.includes("usuario")) mark("username", "El nombre de usuario");
        }

        // Si no logramos identificar, muestra genérico
        if (!e.dni && !e.correo && !e.username) {
          e.general = "Alguno de los campos (DNI / correo / usuario) ya existe.";
        }
      } else {
        // Otros errores del backend
        e.general =
          Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Error al registrarse.";
      }

      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500">Completa todos los campos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI */}
          <div>
            <label className="block text-sm font-medium">DNI</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${errors.dni ? "border-red-500" : ""}`}
            />
            {errors.dni && <p className="text-red-600 text-sm mt-1">{errors.dni}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium">Fecha de nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Nacionalidad */}
          <div>
            <label className="block text-sm font-medium">Nacionalidad</label>
            <select
              name="nacionalidad"
              value={form.nacionalidad}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar</option>
              {NATIONALITIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium">Género</label>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="X">Prefiero no decirlo</option>
            </select>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${errors.correo ? "border-red-500" : ""}`}
            />
            {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${errors.username ? "border-red-500" : ""}`}
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg pr-24 ${errors.password ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 m-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg pr-24 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 m-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                {showConfirm ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium">Imagen (URL)</label>
            <input
              type="url"
              name="img_url"
              value={form.img_url}
              onChange={handleChange}
              required
              placeholder="https://...jpg"
              className={`w-full px-3 py-2 border rounded-lg ${errors.img_url ? "border-red-500" : ""}`}
            />
            {errors.img_url && <p className="text-red-600 text-sm mt-1">{errors.img_url}</p>}
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="text-red-600 text-sm font-medium">{errors.general}</div>
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
