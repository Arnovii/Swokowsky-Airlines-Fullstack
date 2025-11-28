import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import imagenFondo from "../../../assets/imagen_login.jpg";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiImage, FiUserPlus, FiLogIn } from "react-icons/fi";
import { Plane } from "lucide-react";


// Lista de nacionalidades (ejemplo, puedes ampliarla)
const NATIONALITIES = [
  { label: "Afganistán", value: "Afghanistan" },
  { label: "Albania", value: "Albania" },
  { label: "Argelia", value: "Algeria" },
  { label: "Andorra", value: "Andorra" },
  { label: "Angola", value: "Angola" },
  { label: "Antigua y Barbuda", value: "AntiguaAndBarbuda" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armenia", value: "Armenia" },
  { label: "Australia", value: "Australia" },
  { label: "Austria", value: "Austria" },
  { label: "Azerbaiyán", value: "Azerbaijan" },
  { label: "Bahamas", value: "Bahamas" },
  { label: "Baréin", value: "Bahrain" },
  { label: "Bangladés", value: "Bangladesh" },
  { label: "Barbados", value: "Barbados" },
  { label: "Bielorrusia", value: "Belarus" },
  { label: "Bélgica", value: "Belgium" },
  { label: "Belice", value: "Belize" },
  { label: "Benín", value: "Benin" },
  { label: "Bután", value: "Bhutan" },
  { label: "Bolivia", value: "Bolivia" },
  { label: "Bosnia y Herzegovina", value: "BosniaAndHerzegovina" },
  { label: "Botsuana", value: "Botswana" },
  { label: "Brasil", value: "Brazil" },
  { label: "Brunéi", value: "Brunei" },
  { label: "Bulgaria", value: "Bulgaria" },
  { label: "Burkina Faso", value: "BurkinaFaso" },
  { label: "Burundi", value: "Burundi" },
  { label: "Camboya", value: "Cambodia" },
  { label: "Camerún", value: "Cameroon" },
  { label: "Canadá", value: "Canada" },
  { label: "Cabo Verde", value: "CapeVerde" },
  { label: "República Centroafricana", value: "CentralAfricanRepublic" },
  { label: "Chad", value: "Chad" },
  { label: "Chile", value: "Chile" },
  { label: "China", value: "China" },
  { label: "Colombia", value: "Colombia" },
  { label: "Comoras", value: "Comoros" },
  { label: "Congo", value: "Congo" },
  { label: "Costa Rica", value: "CostaRica" },
  { label: "Croacia", value: "Croatia" },
  { label: "Cuba", value: "Cuba" },
  { label: "Chipre", value: "Cyprus" },
  { label: "República Checa", value: "CzechRepublic" },
  { label: "Dinamarca", value: "Denmark" },
  { label: "Yibuti", value: "Djibouti" },
  { label: "Dominica", value: "Dominica" },
  { label: "República Dominicana", value: "DominicanRepublic" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "Egipto", value: "Egypt" },
  { label: "El Salvador", value: "ElSalvador" },
  { label: "Guinea Ecuatorial", value: "EquatorialGuinea" },
  { label: "Eritrea", value: "Eritrea" },
  { label: "Estonia", value: "Estonia" },
  { label: "Esuatini", value: "Eswatini" },
  { label: "Etiopía", value: "Ethiopia" },
  { label: "Fiyi", value: "Fiji" },
  { label: "Finlandia", value: "Finland" },
  { label: "Francia", value: "France" },
  { label: "Gabón", value: "Gabon" },
  { label: "Gambia", value: "Gambia" },
  { label: "Georgia", value: "Georgia" },
  { label: "Alemania", value: "Germany" },
  { label: "Ghana", value: "Ghana" },
  { label: "Grecia", value: "Greece" },
  { label: "Granada", value: "Grenada" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Guinea", value: "Guinea" },
  { label: "Guinea-Bisáu", value: "GuineaBissau" },
  { label: "Guyana", value: "Guyana" },
  { label: "Haití", value: "Haiti" },
  { label: "Honduras", value: "Honduras" },
  { label: "Hungría", value: "Hungary" },
  { label: "Islandia", value: "Iceland" },
  { label: "India", value: "India" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Irán", value: "Iran" },
  { label: "Irak", value: "Iraq" },
  { label: "Irlanda", value: "Ireland" },
  { label: "Israel", value: "Israel" },
  { label: "Italia", value: "Italy" },
  { label: "Costa de Marfil", value: "IvoryCoast" },
  { label: "Jamaica", value: "Jamaica" },
  { label: "Japón", value: "Japan" },
  { label: "Jordania", value: "Jordan" },
  { label: "Kazajistán", value: "Kazakhstan" },
  { label: "Kenia", value: "Kenya" },
  { label: "Kiribati", value: "Kiribati" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Kirguistán", value: "Kyrgyzstan" },
  { label: "Laos", value: "Laos" },
  { label: "Letonia", value: "Latvia" },
  { label: "Líbano", value: "Lebanon" },
  { label: "Lesoto", value: "Lesotho" },
  { label: "Liberia", value: "Liberia" },
  { label: "Libia", value: "Libya" },
  { label: "Liechtenstein", value: "Liechtenstein" },
  { label: "Lituania", value: "Lithuania" },
  { label: "Luxemburgo", value: "Luxembourg" },
  { label: "Madagascar", value: "Madagascar" },
  { label: "Malaui", value: "Malawi" },
  { label: "Malasia", value: "Malaysia" },
  { label: "Maldivas", value: "Maldives" },
  { label: "Malí", value: "Mali" },
  { label: "Malta", value: "Malta" },
  { label: "Islas Marshall", value: "MarshallIslands" },
  { label: "Mauritania", value: "Mauritania" },
  { label: "Mauricio", value: "Mauritius" },
  { label: "México", value: "Mexico" },
  { label: "Micronesia", value: "Micronesia" },
  { label: "Moldavia", value: "Moldova" },
  { label: "Mónaco", value: "Monaco" },
  { label: "Mongolia", value: "Mongolia" },
  { label: "Montenegro", value: "Montenegro" },
  { label: "Marruecos", value: "Morocco" },
  { label: "Mozambique", value: "Mozambique" },
  { label: "Birmania", value: "Myanmar" },
  { label: "Namibia", value: "Namibia" },
  { label: "Nauru", value: "Nauru" },
  { label: "NEpal", value: "Nepa" },
  { label: "Países Bajos", value: "Netherlands" },
  { label: "Nueva Zelanda", value: "NewZealand" },
  { label: "Nicaragua", value: "Nicaragua" },
  { label: "Níger", value: "Niger" },
  { label: "Nigeria", value: "Nigeria" },
  { label: "Corea del Norte", value: "NorthKorea" },
  { label: "Macedonia del Norte", value: "NorthMacedonia" },
  { label: "Noruega", value: "Norway" },
  { label: "Omán", value: "Oman" },
  { label: "Pakistán", value: "Pakistan" },
  { label: "Palaos", value: "Palau" },
  { label: "Panamá", value: "Panama" },
  { label: "Papúa Nueva Guinea", value: "PapuaNewGuinea" },
  { label: "Paraguay", value: "Paraguay" },
  { label: "Perú", value: "Peru" },
  { label: "Filipinas", value: "Philippines" },
  { label: "Polonia", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Catar", value: "Qatar" },
  { label: "Rumanía", value: "Romania" },
  { label: "Rusia", value: "Russia" },
  { label: "Ruanda", value: "Rwanda" },
  { label: "San Cristóbal y Nieves", value: "SaintKittsAndNevis" },
  { label: "Santa Lucía", value: "SaintLucia" },
  { label: "San Vicente y las Granadinas", value: "SaintVincentAndGrenadines" },
  { label: "Samoa", value: "Samoa" },
  { label: "San Marino", value: "SanMarino" },
  { label: "Santo Tomé y Príncipe", value: "SaoTomeAndPrincipe" },
  { label: "Arabia Saudita", value: "SaudiArabia" },
  { label: "Senegal", value: "Senegal" },
  { label: "Serbia", value: "Serbia" },
  { label: "Seychelles", value: "Seychelles" },
  { label: "Sierra Leona", value: "SierraLeone" },
  { label: "Singapur", value: "Singapore" },
  { label: "Eslovaquia", value: "Slovakia" },
  { label: "Eslovenia", value: "Slovenia" },
  { label: "Islas Salomón", value: "SolomonIslands" },
  { label: "Somalia", value: "Somalia" },
  { label: "Sudáfrica", value: "SouthAfrica" },
  { label: "Corea del Sur", value: "SouthKorea" },
  { label: "Sudán del Sur", value: "SouthSudan" },
  { label: "España", value: "Spain" },
  { label: "Sri Lanka", value: "SriLanka" },
  { label: "Sudán", value: "Sudan" },
  { label: "Surinam", value: "Suriname" },
  { label: "Suecia", value: "Sweden" },
  { label: "Suiza", value: "Switzerland" },
  { label: "Siria", value: "Syria" },
  { label: "Taiwán", value: "Taiwan" },
  { label: "Tayikistán", value: "Tajikistan" },
  { label: "Tanzania", value: "Tanzania" },
  { label: "Tailandia", value: "Thailand" },
  { label: "Timor Oriental", value: "TimorLeste" },
  { label: "Togo", value: "Togo" },
  { label: "Tonga", value: "Tonga" },
  { label: "Trinidad y Tobago", value: "TrinidadAndTobago" },
  { label: "Túnez", value: "Tunisia" },
  { label: "Turquía", value: "Turkey" },
  { label: "Turkmenistán", value: "Turkmenistan" },
  { label: "Tuvalu", value: "Tuvalu" },
  { label: "Uganda", value: "Uganda" },
  { label: "Ucrania", value: "Ukraine" },
  { label: "Emiratos Árabes Unidos", value: "UnitedArabEmirates" },
  { label: "Reino Unido", value: "UnitedKingdom" },
  { label: "Estados Unidos", value: "UnitedStates" },
  { label: "Uruguay", value: "Uruguay" },
  { label: "Uzbekistán", value: "Uzbekistan" },
  { label: "Vanuatu", value: "Vanuatu" },
  { label: "Ciudad del Vaticano", value: "VaticanCity" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Vietnam", value: "Vietnam" },
  { label: "Yemen", value: "Yemen" },
  { label: "Zambia", value: "Zambia" },
  { label: "Zimbabue", value: "Zimbabwe" },
];

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dni: 0,
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

  // 🚫 Si es el campo de contraseña, eliminamos los espacios
  const cleanValue = name === "password" || name === "confirmPassword" ? value.replace(/\s/g, "") : value;

  setForm({ ...form, [name]: cleanValue });
};


  // Maneja la selección de archivo de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImgFile(file ?? null);
    setError(null);
  };

  // Validación del formulario
 // ✅ Validaciones completas
  const validateForm = () => {
    if (!form.dni || isNaN(Number(form.dni))) {
      return "El DNI debe ser un número válido.";
    }
    if (form.dni.toString().trim().length < 8) {
      return "El DNI debe tener al menos 8 dígitos.";
    }

    if (!form.nombre.trim()) {
      return "El nombre no puede estar vacío ni contener solo espacios.";
    }
    if (/\d/.test(form.nombre)) {
      return "El nombre no puede contener números.";
    }

    if (!form.apellido.trim()) {
      return "El apellido no puede estar vacío ni contener solo espacios.";
    }
    if (/\d/.test(form.apellido)) {
      return "El apellido no puede contener números.";
    }

    // Validación de fecha
    const fecha = new Date(form.fecha_nacimiento);
    const minDate = new Date("1915-01-01");
    const today = new Date();
    if (isNaN(fecha.getTime())) {
      return "Debes ingresar una fecha de nacimiento válida.";
    }
    if (fecha < minDate) {
      return "La fecha de nacimiento no puede ser anterior a 1900.";
    }
    if (fecha > today) {
      return "La fecha de nacimiento no puede ser posterior a hoy.";
    }

    if (!form.nacionalidad) {
      return "Debes seleccionar una nacionalidad.";
    }
    if (!form.genero) {
      return "Debes seleccionar un género.";
    }

    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      return "El correo no es válido.";
    }

    if (!form.username.trim()) {
      return "El nombre de usuario no puede estar vacío ni tener solo espacios.";
    }

    if (!form.password.trim()) {
      return "La contraseña no puede estar vacía ni tener solo espacios.";
    }

    if (form.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    // Validación de imagen
    if (!imgFile) {
      return "Debes seleccionar una imagen.";
    }
    const maxBytes = 5 * 1024 * 1024;
    if (imgFile.size > maxBytes) {
      return "La imagen no puede ser mayor a 5 MB.";
    }
    if (!/\.(jpg|jpeg|png|gif)$/i.test(imgFile.name)) {
      return "La imagen debe tener una extensión válida (.jpg, .jpeg, .png, .gif).";
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
        dni: Math.floor(form.dni),
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
        auth.login(form.correo, form.password)
        navigate("/");
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
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center py-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${imagenFondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay con degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#081225]/95 via-[#0a1533]/90 to-[#081225]/95 backdrop-blur-sm"></div>
      
      {/* Efectos decorativos */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Card de registro - Fondo blanco */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header del card */}
          <div className="bg-gradient-to-r from-[#081225] via-[#0a1533] to-[#081225] px-8 py-6 border-b border-cyan-500/20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                ¡Únete a nosotros!
              </h1>
              <p className="text-cyan-200/80 text-sm">
                Completa todos los campos para crear tu cuenta
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DNI */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">DNI</label>
                <input
                  type="number"
                  name="dni"
                  defaultValue=""
                  onChange={handleChange}
                  required
                  placeholder="12345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  maxLength={8}
                />
              </div>

              {/* Nombre y Apellido en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    maxLength={40}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    placeholder="Pérez"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                />
              </div>

              {/* Nacionalidad y Género en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                  <select
                    name="nacionalidad"
                    value={form.nacionalidad}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  >
                    <option value="">Seleccionar</option>
                    {NATIONALITIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Género</label>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">Otro</option>
                  </select>
                </div>
              </div>

              {/* Correo */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-[#0a1533]" />
                  </div>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-[#0a1533]" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="usuario123"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Contraseñas en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-[#0a1533]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#0a1533] transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Confirmar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-[#0a1533]" />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#0a1533] transition-colors"
                    >
                      {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Imagen */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Foto de perfil</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-gray-500 hover:bg-gray-100 hover:border-cyan-500/50 transition-all duration-300">
                      <FiImage className="h-5 w-5" />
                      <span className="text-sm">{imgFile ? imgFile.name : "Seleccionar imagen..."}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                    />
                  </label>
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-14 h-14 object-cover rounded-xl border-2 border-cyan-500/30"
                    />
                  )}
                </div>
              </div>

              {/* Mensajes de estado y error */}
              {uploading && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-blue-600 text-sm">Subiendo imagen...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0a1533] to-[#1a3a5c] text-white py-3.5 rounded-xl font-semibold hover:from-[#0d1d40] hover:to-[#1e4470] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-[#0a1533]/25 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Crear cuenta</span>
                  </>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Botón Login */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-[#0a1533] py-3.5 rounded-xl font-semibold hover:bg-gray-100 hover:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 group"
            >
              <FiLogIn className="w-5 h-5 text-cyan-600 group-hover:translate-x-1 transition-transform" />
              <span>Iniciar sesión</span>
            </button>
          </div>
        </div>

        {/* Footer decorativo */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Plane className="w-4 h-4" />
            <span>Tu próxima aventura comienza aquí</span>
          </div>
        </div>
      </div>
    </div>
  );
}
