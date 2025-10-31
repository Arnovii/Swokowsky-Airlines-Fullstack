import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";


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

interface Profile {
  id_usuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  direccion_facturacion: string;
  genero: "M" | "F" | "X";
  correo: string;
  username: string;
  img_url: string;
  suscrito_noticias: boolean;
  creado_en: string;
  must_change_password: boolean;
  tipo_usuario?: string;
}

const getGenero = (g: "M" | "F" | "X") => {
  switch (g) {
    case "M":
      return "Masculino";
    case "F":
      return "Femenino";
    default:
      return "Otro";
  }
};

// NUEVO: Tipos para monedero y métodos de pago
type ActiveTab = "personal" | "contact" | "security" | "wallet";

type CardBrand = "visa" | "mastercard" | "amex" | "otro";

interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  holder: string;
  expMonth: string; // "MM"
  expYear: string;  // "YY" o "YYYY"
  isDefault?: boolean;
}

// NUEVO: helpers visuales para la marca de la tarjeta
const brandIcon = (b: CardBrand) => {
  const base = "px-2 py-1 rounded text-xs font-semibold";
  switch (b) {
    case "visa":
      return <span className={`${base} bg-blue-100 text-blue-700`}>VISA</span>;
    case "mastercard":
      return <span className={`${base} bg-orange-100 text-orange-700`}>MASTERCARD</span>;
    case "amex":
      return <span className={`${base} bg-cyan-100 text-cyan-700`}>AMEX</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-700`}>TARJETA</span>;
  }
};

// NUEVO: máscara para previsualizar número
const maskCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ").replace(/\d(?=\d{4})/g, "•");
};


// MANTENER: export default con tu estructura base + nuevas piezas
export default function Perfil() {
  // MANTENER: helper de nacionalidades
  const getNationalityLabel = (val?: string) =>
    NATIONALITIES.find((c) => c.value === val)?.label ?? val ?? "-";

  const auth = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile>();

  // 🔁 CAMBIO: ahora ActiveTab incluye "wallet"
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");

  // Sincronizar tabs con query parameters
const [searchParams, setSearchParams] = useSearchParams();
const tabFromUrl = searchParams.get("tab") as ActiveTab | null;

useEffect(() => {
  if (tabFromUrl && ["personal", "contact", "security", "wallet"].includes(tabFromUrl)) {
    setActiveTab(tabFromUrl);
  } else {
    setSearchParams({ tab: "personal" });
  }
}, [tabFromUrl, setSearchParams]);

  const handleTabChange = (newTab: ActiveTab) => {
  setActiveTab(newTab);
  setSearchParams({ tab: newTab });
};


  // MANTENER: seguridad
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // MANTENER: edición
  const [editPersonal, setEditPersonal] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [personalForm, setPersonalForm] = useState<any>({});
  const [contactForm, setContactForm] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NUEVO: estado del monedero y métodos (mock por ahora)
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      brand: "visa",
      last4: "4242",
      holder: "Nombre Apellido",
      expMonth: "12",
      expYear: "27",
      isDefault: true,
    },
  ]);

  // NUEVO: modal "Añadir tarjeta"
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardForm, setAddCardForm] = useState({
    holder: "",
    number: "",
    exp: "", // MM/YY
    cvc: "",
    brand: "visa" as CardBrand,
    makeDefault: true,
  });
  const [addCardError, setAddCardError] = useState<string | null>(null);

  // NUEVO: helpers de "Añadir tarjeta"
  const parseExp = (exp: string) => {
    const m = exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) return null;
    return { month: m[1], year: m[2] };
  };

  const canSubmitCard =
    addCardForm.holder.trim().length >= 3 &&
    addCardForm.number.replace(/\D/g, "").length >= 12 &&
    !!parseExp(addCardForm.exp) &&
    addCardForm.cvc.replace(/\D/g, "").length >= 3;

  const handleAddCard = () => {
    setAddCardError(null);
    if (!canSubmitCard) {
      setAddCardError("Por favor completa los campos correctamente.");
      return;
    }
    const digits = addCardForm.number.replace(/\D/g, "");
    const parsed = parseExp(addCardForm.exp)!;

    const newPm: PaymentMethod = {
      id: `pm_${Date.now()}`,
      brand: addCardForm.brand,
      last4: digits.slice(-4),
      holder: addCardForm.holder.trim(),
      expMonth: parsed.month,
      expYear: parsed.year,
      isDefault: addCardForm.makeDefault || paymentMethods.length === 0,
    };

    let next = paymentMethods.map((p) => ({ ...p }));
    if (newPm.isDefault) {
      next = next.map((p) => ({ ...p, isDefault: false }));
    }
    next.unshift(newPm);
    setPaymentMethods(next);

    setShowAddCard(false);
    setAddCardForm({ holder: "", number: "", exp: "", cvc: "", brand: "visa", makeDefault: true });
  };

  const setAsDefault = (id: string) => {
    setPaymentMethods((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  const removeMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
  };

  const mockTopUp = () => {
    // NUEVO: solo UI (suma 50 al saldo)
    setWalletBalance((b) => b + 50);
  };

  // MANTENER: subida a Cloudinary
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

  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // MANTENER: useEffect de perfil (con comentario para futura integración del monedero)
  useEffect(() => {
    const getProfileInfo = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
        setPersonalForm({
          nombre: res.data.nombre,
          apellido: res.data.apellido,
          nacionalidad: res.data.nacionalidad,
          genero: res.data.genero,
          username: res.data.username,
          img_url: res.data.img_url,
        });
        setContactForm({
          direccion_facturacion: res.data.direccion_facturacion,
          correo: res.data.correo,
          suscrito_noticias: res.data.suscrito_noticias,
        });

        // FUTURO (NUEVO): traer saldo y métodos reales del backend
        // const wallet = await api.get('/wallet/me');
        // setWalletBalance(wallet.data.balance);
        // setPaymentMethods(wallet.data.methods);
      } catch (err) {
        console.error(err);
      }
    };
    getProfileInfo();
  }, []);

  // MANTENER: cargando
  if (!profile) return <div className="text-center py-10">Cargando...</div>;

  return (
    <>
      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100">
          {/* MANTENER: cabecera */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <img
                src={profile.img_url || "https://via.placeholder.com/150"}
                alt="Foto de perfil"
                className="relative w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-[#081225]">
              {profile.nombre} {profile.apellido}
            </h1>
            <p className="text-sm text-[#3B82F6] mt-2 font-medium flex items-center justify-center gap-2">
              @{profile.username}
              {profile.tipo_usuario && (
                <span className="bg-[#0F6899] text-white px-2 py-1 rounded-full text-xs ml-2">
                  {profile.tipo_usuario}
                </span>
              )}
            </p>
          </div>

          {/* MANTENER: botón admin */}
          {profile.tipo_usuario === "admin" && (
            <div className="mt-6 flex justify-center pb-4">
              <button
                type="button"
                onClick={() => navigate("/panelAdministrador")}
                className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 font-medium"
              >
                Ir al Panel Administrador
              </button>
            </div>
          )}

          {/* MANTENER: botón root */}
          {profile.tipo_usuario === "root" && (
            <div className="mt-6 flex justify-center pb-4">
              <button
                type="button"
                onClick={() => navigate("/panelAdministrador/root")}
                className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 font-medium"
              >
                Ir al Panel Root
              </button>
            </div>
          )}

          {/* TABS (agregamos Monedero) */}
          <div className="flex justify-center mb-8 bg-gray-50 rounded-lg p-2">
            {[
              { id: "personal", label: "Información personal", icon: "👤" },
              { id: "contact", label: "Información de contacto", icon: "📧" },
              { id: "security", label: "Seguridad", icon: "🔒" },
              { id: "wallet", label: "Monedero", icon: "💳" }, // NUEVO
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ActiveTab);
                  setShowPasswordForm(false);
                  setPasswordMessage(null);
                }}
                className={`px-6 py-3 mx-2 text-sm font-medium rounded-lg focus:outline-none transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                    : "text-gray-600 hover:text-[#0F6899] hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* CONTENIDO TABS */}
          <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
            {/* === PERSONAL (MANTENER) === */}
            {activeTab === "personal" && (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdateMessage(null);
                  const toUpdate: any = {};
                  (Object.keys(personalForm) as Array<keyof typeof personalForm>).forEach((key) => {
                    if (personalForm[key] !== (profile as any)[key]) {
                      toUpdate[key] = personalForm[key];
                    }
                  });
                  if (Object.keys(toUpdate).length === 0) {
                    setUpdateMessage("No hay cambios para actualizar.");
                    return;
                  }
                  try {
                    await api.patch("/profile", toUpdate);
                    setUpdateMessage("✅ Datos actualizados correctamente.");
                    setEditPersonal(false);
                    setProfile({ ...profile, ...toUpdate });
                  } catch (err: any) {
                    setUpdateMessage(err.response?.data?.message || "❌ Error al actualizar datos.");
                  }
                }}
              >
                {/* MANTENER: todos tus inputs de personal */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.nombre || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, nombre: e.target.value })}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.apellido || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, apellido: e.target.value })}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Género
                  </label>
                  <select
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.genero || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, genero: e.target.value })}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">Otro</option>
                  </select>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Nacionalidad
                  </label>
                  {editPersonal ? (
                    <select
                      name="nacionalidad"
                      value={personalForm.nacionalidad ?? ""}
                      onChange={(e) => setPersonalForm({ ...personalForm, nacionalidad: e.target.value })}
                      required
                      className="mt-2 w-full p-2 border rounded-lg"
                    >
                      <option value="">Seleccionar</option>
                      {NATIONALITIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 w-full p-2 border rounded-lg bg-gray-50">
                      {getNationalityLabel(personalForm.nacionalidad)}
                    </div>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.username || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Foto de perfil
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      value={personalForm.img_url || ""}
                      disabled
                      readOnly
                    />
                    {editPersonal && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              try {
                                setUpdateMessage("Subiendo imagen...");
                                const url = await uploadToCloudinary(e.target.files[0]);
                                setPersonalForm({ ...personalForm, img_url: url });
                                setUpdateMessage("✅ Imagen subida correctamente.");
                              } catch (err: any) {
                                setUpdateMessage("❌ Error al subir imagen: " + err.message);
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Subir foto
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-4 mt-4">
                  {updateMessage && (
                    <span
                      className={`text-sm ${
                        updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {updateMessage}
                    </span>
                  )}
                  {!editPersonal ? (
                    <button
                      type="button"
                      className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                      onClick={() => setEditPersonal(true)}
                    >
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg"
                        onClick={() => {
                          setEditPersonal(false);
                          setPersonalForm({ ...profile });
                          setUpdateMessage(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                      >
                        Guardar cambios
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {/* === CONTACT (MANTENER) === */}
            {activeTab === "contact" && (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdateMessage(null);
                  const toUpdate: any = {};
                  (Object.keys(contactForm) as Array<keyof typeof contactForm>).forEach((key) => {
                    if (contactForm[key] !== (profile as any)[key]) {
                      toUpdate[key] = contactForm[key];
                    }
                  });
                  if (Object.keys(toUpdate).length === 0) {
                    setUpdateMessage("No hay cambios para actualizar.");
                    return;
                  }
                  try {
                    await api.patch("/profile", toUpdate);
                    setUpdateMessage("✅ Datos actualizados correctamente.");
                    setEditContact(false);
                    setProfile({ ...profile, ...toUpdate });
                  } catch (err: any) {
                    setUpdateMessage(err.response?.data?.message || "❌ Error al actualizar datos.");
                  }
                }}
              >
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-200 disabled:border-gray-300 disabled:cursor-not-allowed"
                    value={contactForm.correo || ""}
                    disabled={true}
                    onChange={(e) => setContactForm({ ...contactForm, correo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Dirección de facturación
                  </label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={contactForm.direccion_facturacion || ""}
                    disabled={!editContact}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, direccion_facturacion: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Suscrito a noticias
                  </label>
                  <input
                    type="checkbox"
                    checked={!!contactForm.suscrito_noticias}
                    disabled={!editContact}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, suscrito_noticias: e.target.checked })
                    }
                    className="ml-2"
                  />
                </div>
                <div className="col-span-2 flex justify-end items-center gap-4 mt-4">
                  {updateMessage && (
                    <span
                      className={`text-sm ${
                        updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {updateMessage}
                    </span>
                  )}
                  {!editContact ? (
                    <button
                      type="button"
                      className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                      onClick={() => setEditContact(true)}
                    >
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg"
                        onClick={() => {
                          setEditContact(false);
                          setContactForm({ ...profile });
                          setUpdateMessage(null);
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg"
                      >
                        Guardar cambios
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {/* === SECURITY (MANTENER) === */}
            {activeTab === "security" && (
              <form
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordMessage(null);
                  if (newPassword.length < 8) {
                    setPasswordMessage("❌ La nueva contraseña debe tener al menos 8 caracteres.");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordMessage("❌ Las nuevas contraseñas no coinciden.");
                    return;
                  }
                  if (!newPassword) {
                    setPasswordMessage("No hay cambios para actualizar.");
                    return;
                  }
                  try {
                    await api.patch("/profile", { password_bash: newPassword });
                    auth.logout();
                    navigate("/login");
                    setPasswordMessage("✅ Contraseña actualizada correctamente.");
                    setShowPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err: any) {
                    setPasswordMessage(
                      err.response?.data?.message || "❌ No se pudo cambiar la contraseña."
                    );
                  }
                }}
              >
                {!showPasswordForm ? (
                  <>
                    <p className="text-gray-600 mb-6 text-center">
                      🔒 Por seguridad, tu contraseña no se muestra aquí.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300 font-medium"
                    >
                      Cambiar contraseña
                    </button>
                  </>
                ) : (
                  <>
                    {passwordMessage && (
                      <div
                        className={`p-4 rounded-lg text-sm text-center ${
                          passwordMessage.startsWith("✅")
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {passwordMessage}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordMessage(null);
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-300"
                      >
                        Guardar contraseña
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* === NUEVO: MONEDERO === */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                {/* Saldo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Saldo actual</p>
                    <p className="text-3xl font-bold text-[#081225] mt-1">
                      ${walletBalance.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCard(true)}
                      className="px-4 py-2 rounded-lg bg-white border border-[#0F6899] text-[#0F6899] hover:bg-[#0F6899] hover:text-white transition"
                    >
                      Añadir tarjeta
                    </button>
                    <button
                      type="button"
                      onClick={mockTopUp}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#3B82F6]/20 transition"
                    >
                      Recargar saldo
                    </button>
                  </div>
                </div>

                {/* Métodos */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-[#081225] mb-4">Métodos de pago</h3>

                  {paymentMethods.length === 0 ? (
                    <div className="text-gray-500 text-sm">
                      No tienes tarjetas registradas.{" "}
                      <button onClick={() => setShowAddCard(true)} className="text-[#0F6899] underline">
                        Añade una tarjeta
                      </button>
                      .
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {paymentMethods.map((pm) => (
                        <li key={pm.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {brandIcon(pm.brand)}
                            <div>
                              <p className="text-sm font-medium text-[#081225]">
                                {pm.holder} • • • • {pm.last4}
                              </p>
                              <p className="text-xs text-gray-500">
                                Vence {pm.expMonth}/{pm.expYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {pm.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Predeterminada
                              </span>
                            )}
                            {!pm.isDefault && (
                              <button
                                type="button"
                                onClick={() => setAsDefault(pm.id)}
                                className="text-xs px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                              >
                                Hacer predeterminada
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeMethod(pm.id)}
                              className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  * Solo UI: la recarga y el guardado de tarjetas se integrarán con el backend/pasarela.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NUEVO: MODAL AÑADIR TARJETA */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#081225] mb-1">Añadir tarjeta</h3>
              <p className="text-sm text-gray-500 mb-4">Registra un método de pago para recargar tu monedero.</p>

              {addCardError && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  {addCardError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    value={addCardForm.holder}
                    onChange={(e) => setAddCardForm((s) => ({ ...s, holder: e.target.value }))}
                    className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addCardForm.number}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 19);
                      const groups = v.match(/.{1,4}/g) || [];
                      setAddCardForm((s) => ({ ...s, number: groups.join(" ") }));
                    }}
                    className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="1234 5678 9012 3456"
                  />
                  <p className="text-xs text-gray-400 mt-1">{maskCardNumber(addCardForm.number || "")}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                      Mes/Año
                    </label>
                    <input
                      type="text"
                      value={addCardForm.exp}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                        setAddCardForm((s) => ({ ...s, exp: v }));
                      }}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                      CVC
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={addCardForm.cvc}
                      onChange={(e) =>
                        setAddCardForm((s) => ({ ...s, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                      }
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="123"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                      Marca
                    </label>
                    <select
                      value={addCardForm.brand}
                      onChange={(e) => setAddCardForm((s) => ({ ...s, brand: e.target.value as CardBrand }))}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="makeDefault"
                    type="checkbox"
                    checked={addCardForm.makeDefault}
                    onChange={(e) => setAddCardForm((s) => ({ ...s, makeDefault: e.target.checked }))}
                  />
                  <label htmlFor="makeDefault" className="text-sm text-gray-700">
                    Establecer como método predeterminado
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!canSubmitCard}
                  onClick={handleAddCard}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    canSubmitCard
                      ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Guardar tarjeta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}