import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import imagenFondo from "../../../assets/imagen_login.jpg";
import { FiEye, FiEyeOff } from "react-icons/fi";


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
      className="flex items-center justify-center min-h-screen bg-cover bg-center pt-8 pb-6"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(${imagenFondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500">Completa todos los campos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8 mb-6">
          {/* DNI */}
          <div>
            <label className="block text-sm font-medium">DNI</label>
            <input
              type="number"
              name="dni"
              defaultValue=""

              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
              maxLength={8}
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
              maxLength={40}
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
              maxLength={20}
            />
          </div>
          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium">Fecha de Nacimiento</label>
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
            <label className="block text-sm font-medium">Lugar de Nacimiento</label>
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
              maxLength={50}
            />
          </div>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
              maxLength={20}
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium">Confirmar Contraseña</label>
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
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
            <div className="text-sm text-gray-600">
              Subiendo imagen a Cloudinary...
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}
          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {/* Sección inferior */}
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
