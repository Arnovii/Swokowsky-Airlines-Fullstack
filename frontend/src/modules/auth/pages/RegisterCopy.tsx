import React, { useEffect, useState } from "react";
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
  img_file: string;
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
  });

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!imgFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imgFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imgFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, img_file: undefined, general: undefined }));
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImgFile(null);
      return;
    }
    setImgFile(file);
  };

  const validateClient = (): FieldErrors => {
    const e: FieldErrors = {};

    if (form.dni.length < 8 || form.dni.length > 20) {
      e.dni = "El DNI debe tener entre 8 y 20 caracteres.";
    }

    if (form.username.length < 6 || form.username.length > 20) {
      e.username = "El nombre de usuario debe tener entre 6 y 20 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = "El correo no es válido.";
    }

    if (form.password.length < 8) {
      e.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (form.confirmPassword !== form.password) {
      e.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!imgFile) {
      e.img_file = "Debes seleccionar una imagen.";
    } else {
      const name = imgFile.name || "";
      if (!/\.(jpg|jpeg|png|gif)$/i.test(name)) {
        e.img_file = "La imagen debe ser .jpg, .jpeg, .png o .gif";
      }
      const maxBytes = 5 * 1024 * 1024; // 5 MB
      if (imgFile.size > maxBytes) {
        e.img_file = "La imagen no puede ser mayor a 5 MB.";
      }
      if (!imgFile.type.startsWith("image/")) {
        e.img_file = "El archivo debe ser una imagen.";
      }
    }

    return e;
  };

  // Subida directa a Cloudinary (unsigned preset)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const url = "https://api.cloudinary.com/v1_1/dycqxw0aj/image/upload";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "Swokowsky-bucket");

    const res = await fetch(url, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload a Cloudinary falló: ${res.status} ${text}`);
    }

    const data = await res.json();
    if (!data.secure_url) throw new Error("No se recibió secure_url desde Cloudinary");
    return data.secure_url as string;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors({});
    setLoading(true);

    const clientErr = validateClient();
    if (Object.keys(clientErr).length) {
      setErrors(clientErr);
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      if (imgFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imgFile);
        setUploading(false);
      }

      const payload = {
        dni: form.dni,
        nombre: form.nombre,
        apellido: form.apellido,
        fecha_nacimiento: form.fecha_nacimiento ? new Date(form.fecha_nacimiento).toISOString() : null,
        nacionalidad: form.nacionalidad,
        genero: form.genero,
        correo: form.correo,
        username: form.username,
        password_bash: form.password,
        img_url: imageUrl,
      } as any;

      const res = await api.post("/auth/register", payload);

      if (res.status === 201 || res.status === 200) {
        navigate("/login");
        return;
      }

      setErrors({ general: "No se pudo crear el usuario." });
    } catch (err: any) {
      const data = err?.response?.data;
      const msg: string | undefined = data?.message;
      const code: string | undefined = data?.code;
      const target: string[] | string | undefined = data?.meta?.target;

      const e: FieldErrors = {};

      if (code === "P2002" || /unique constraint/i.test(msg || "")) {
        const targets = Array.isArray(target)
          ? target
          : typeof target === "string"
          ? [target]
          : [];
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
          if (text.includes("dni")) mark("dni", "El DNI");
          if (text.includes("correo") || text.includes("email")) mark("correo", "El correo");
          if (text.includes("username") || text.includes("usuario")) mark("username", "El nombre de usuario");
        }

        if (!e.dni && !e.correo && !e.username) {
          e.general = "Alguno de los campos (DNI / correo / usuario) ya existe.";
        }
      } else {
        if (err?.message && err?.message.includes("Cloudinary")) {
          e.general = err.message;
        } else {
          e.general = Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Error al registrarse.";
        }
      }

      setErrors(e);
    } finally {
      setUploading(false);
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

          {/* Imagen: file input */}
          <div>
            <label className="block text-sm font-medium">Imagen (subir)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className={`w-full px-3 py-2 border rounded-lg ${errors.img_file ? "border-red-500" : ""}`}
            />
            {errors.img_file && <p className="text-red-600 text-sm mt-1">{errors.img_file}</p>}

            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-md border" />
              </div>
            )}
          </div>

          {uploading && <div className="text-sm text-gray-600">Subiendo imagen a Cloudinary...</div>}
          {errors.general && <div className="text-red-600 text-sm font-medium">{errors.general}</div>}

          <button
            type="submit"
            disabled={loading || uploading}
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
