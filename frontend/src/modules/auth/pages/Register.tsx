import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

// Lista de nacionalidades (ejemplo, puedes ampliarla)
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
  });

  // Estado para la imagen seleccionada, previsualización y flags de carga
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Crear una URL de previsualización y limpiarla cuando cambie la imagen
  useEffect(() => {
    if (!imgFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(imgFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imgFile]);

  // Maneja los cambios en los campos del formulario de texto/select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Maneja la selección de archivo de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImgFile(file ?? null);
    setError(null);
  };

  // Validación del formulario
  const validateForm = () => {
    if (form.dni.length < 8 || form.dni.length > 20) {
      return "El DNI debe tener entre 8 y 20 caracteres";
    }
    if (form.username.length < 4 || form.username.length > 21) {
      return "El nombre de usuario debe tener entre 5 y 20 caracteres";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      return "El correo no es válido";
    }
    if (form.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    // Validación de la imagen
    if (!imgFile) {
      return "Debes seleccionar una imagen";
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (imgFile.size > maxBytes) {
      return "La imagen no puede ser mayor a 5 MB";
    }
    if (!/\.(jpg|jpeg|png|gif)$/i.test(imgFile.name)) {
      return "La imagen debe ser un archivo válido (.jpg, .jpeg, .png, .gif)";
    }
    return null;
  };

  // Sube la imagen a Cloudinary y devuelve la secure_url
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

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
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
        fecha_nacimiento: new Date(form.fecha_nacimiento).toISOString(),
        nacionalidad: form.nacionalidad,
        genero: form.genero,
        correo: form.correo,
        username: form.username,
        password_bash: form.password,
        img_url: imageUrl,
      };
      const res = await api.post("/auth/register", payload);
      if (res.status === 201 || res.status === 200) {
        navigate("/login");
      }
    } catch (err: any) {
      // Captura el mensaje devuelto por el backend o por Cloudinary
      const message = err.response?.data?.message || err.message;
      setError(message ?? "Error al registrarse, inténtalo nuevamente.");
    } finally {
      setLoading(false);
      setUploading(false);
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
              className="w-full px-3 py-2 border rounded-lg"
            />
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
              <option value="X">Otro</option>
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
              className="w-full px-3 py-2 border rounded-lg"
            />
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
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>
          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showConfirm ? "👁️" : "🙈"}
              </button>
            </div>
          </div>
          {/* Imagen: archivo a subir */}
          <div>
            <label className="block text-sm font-medium">Imagen (subir)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
          {/* Mensajes de estado y error */}
          {uploading && (
            <div className="text-sm text-gray-600">Subiendo imagen a Cloudinary...</div>
          )}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}
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