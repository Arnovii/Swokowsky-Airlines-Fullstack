import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

// Lista de nacionalidades (recortada por brevedad; usa tu lista completa)
const NATIONALITIES = [
  { label: "Colombia", value: "Colombia" },
  { label: "Argentina", value: "Argentina" },
  { label: "España", value: "Spain" },
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

const maskCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ").replace(/\d(?=\d{4})/g, "•");
};

// Formateo COP
const formatCOP = (n: number) => {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n.toLocaleString("es-CO")} COP`;
  }
};

export default function Perfil() {
  const getNationalityLabel = (val?: string) =>
    NATIONALITIES.find((c) => c.value === val)?.label ?? val ?? "-";

  const auth = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile>();
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");

  // Sincronizar tabs con query params
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

  // Seguridad
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // Edición
  const [editPersonal, setEditPersonal] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [personalForm, setPersonalForm] = useState<any>({});
  const [contactForm, setContactForm] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monedero (solo saldoTotalUsuario) y métodos (UI local)
  const [walletBalance, setWalletBalance] = useState<number>(0); // saldoTotalUsuario
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]); // UI local

  // Modal añadir tarjeta
  const [showAddCard, setShowAddCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [addCardForm, setAddCardForm] = useState({
    holder: "",
    number: "",
    exp: "", // "MM/YY"
    cvc: "",
    brand: "visa" as CardBrand, // solo para UI
    makeDefault: true,
    banco: "",
    tipo: "credito" as "credito" | "debito",
  });
  const [addCardError, setAddCardError] = useState<string | null>(null);
  const [addCardOk, setAddCardOk] = useState<string | null>(null);

  // Parse exp "MM/YY"
  const parseExp = (exp: string) => {
    const m = exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) return null;
    const month = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    if (month < 1 || month > 12) return null;
    const year = 2000 + yy; // 27 -> 2027
    return { month, year };
  };

  const canSubmitCard = (() => {
    const exp = parseExp(addCardForm.exp);
    return (
      addCardForm.holder.trim().length >= 3 &&
      addCardForm.cvc.replace(/\D/g, "").length >= 3 &&
      !!exp &&
      addCardForm.banco.trim().length >= 2 &&
      (addCardForm.tipo === "credito" || addCardForm.tipo === "debito")
    );
  })();

  // --- GET /api/v1/tarjetas -> usar saldoTotalUsuario ---
  const fetchWallet = async () => {
    setWalletError(null);
    setWalletLoading(true);
    try {
      // si api ya tiene baseURL=/api/v1, con "/tarjetas" basta
      const res = await api.get("/tarjetas");
      // esperamos un shape: { tarjetas: [...], saldoTotalUsuario: number }
      const total = Number(res?.data?.saldoTotalUsuario ?? 0);
      setWalletBalance(Number.isFinite(total) ? total : 0);
      // (Opcional) podríamos mapear tarjetas a paymentMethods, pero por ahora solo necesitamos el saldo
    } catch (err: any) {
      console.error("GET /tarjetas error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo obtener el saldo.";
      setWalletError(msg);
    } finally {
      setWalletLoading(false);
    }
  };

  // POST /api/v1/tarjetas/cards


  const handleAddCard = async () => {
    setAddCardError(null);
    setAddCardOk(null);

    if (!canSubmitCard) {
      setAddCardError("Por favor completa los campos correctamente.");
      return;
    }

    try {
      setSavingCard(true);

      const { month, year } = parseExp(addCardForm.exp)!;
      const titular = addCardForm.holder.trim();
      const banco = addCardForm.banco.trim();
      const cvv = String(addCardForm.cvc || "").replace(/\D/g, "");
      const digitsOnly = String(addCardForm.number || "").replace(/\D/g, "");

      if (digitsOnly.length < 16) {
        setAddCardError("El número de tarjeta debe tener al menos 16 dígitos.");
        return;
      }

      const payload = {
        num_tarjeta: digitsOnly,
        titular,
        vence_mes: month,
        vence_anio: year,
        cvv_ene: cvv,
        tipo: addCardForm.tipo,
        banco,
        creado_en: new Date().toISOString(),
      };

      // 🟢 Crea la tarjeta
      const res = await api.post("/tarjetas/cards", payload);
      console.log("Respuesta creación tarjeta:", res.data);

      // 🧩 Ajuste importante: a veces el backend devuelve directamente el objeto
      // y otras veces dentro de res.data.tarjeta
      const tarjeta = res.data?.tarjeta ?? res.data ?? null;

      // 🔁 Refresca el saldo
      await fetchWallet();

      if (tarjeta && tarjeta.id_tarjeta) {
        // 🆔 Usa el ID real devuelto
        const newPm: PaymentMethod = {
          id: String(tarjeta.id_tarjeta),
          brand: "visa", // 👈 detecta automáticamente
          last4: String(tarjeta.num_tarjeta).slice(-4),
          holder: tarjeta.titular,
          expMonth: String(tarjeta.vence_mes).padStart(2, "0"),
          expYear: String(tarjeta.vence_anio),
          isDefault: addCardForm.makeDefault || paymentMethods.length === 0,
        };

        // Agrega la tarjeta localmente
        setPaymentMethods((prev) => [newPm, ...prev]);
      } else {
        // Si no devuelve la tarjeta, vuelve a pedirlas
        await fetchCards();
      }

      setAddCardOk("✅ Tarjeta guardada correctamente.");
      setShowAddCard(false);
      setAddCardForm({
        holder: "",
        number: "",
        exp: "",
        cvc: "",
        brand: "visa",
        makeDefault: true,
        banco: "",
        tipo: "credito",
      });
    } catch (err: any) {
      console.error("Crear tarjeta error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ No se pudo guardar la tarjeta.";
      setAddCardError(msg);
    } finally {
      setSavingCard(false);
    }
  };




  const setAsDefault = (id: string) => {
    setPaymentMethods((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  const removeMethod = async (id: string) => {
    try {
      // llama directamente al backend con axios
      const res = await api.delete(`/tarjetas/cards/${id}`);
      console.log("Tarjeta borrada:", res.data);

      // actualiza estado local
      setPaymentMethods(prev => prev.filter(p => String(p.id) !== String(id)));

      // actualiza el saldo en pantalla
      await fetchWallet();
    } catch (err: any) {
      console.error("Error al eliminar tarjeta:", err?.response?.data || err);
      alert(err?.response?.data?.message || "No se pudo eliminar la tarjeta");
    }
  };



  const uploadToCloudinary = async (file: File): Promise<string> => {
    const url = "https://api.cloudinary.com/v1_1/dycqxw0aj/image/upload";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "Swokowsky-bucket");
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload a Cloudinary falló: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("No se recibió secure_url desde Cloudinary");
    return data.secure_url as string;
  };

  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      const res = await api.get("/tarjetas");
      const tarjetas = (res.data.tarjetas || []).map((t: any) => ({
        id: String(t.id_tarjeta),
        brand: "visa", // 👈 detecta automáticamente
        last4: t.num_tarjeta.slice(-4),
        holder: t.titular,
        expMonth: String(t.vence_mes).padStart(2, "0"),
        expYear: String(t.vence_anio),
      }));

      setPaymentMethods(tarjetas);
    } catch (err: any) {
      console.error("Error obteniendo tarjetas:", err?.response?.data || err);
    }
  };


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

        // ✅ Traer saldo y tarjetas reales
        fetchWallet();
        fetchCards();  // 👈 agrega esta línea
      } catch (err) {
        console.error(err);
      }
    };
    getProfileInfo();
  }, []);


  if (!profile) return <div className="text-center py-10">Cargando...</div>;

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100">
          {/* Cabecera */}
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

          {/* Accesos Panel */}
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

          {/* Tabs */}
          <div className="flex justify-center mb-8 bg-gray-50 rounded-lg p-2">
            {[
              { id: "personal", label: "Información personal", icon: "👤" },
              { id: "contact", label: "Información de contacto", icon: "📧" },
              { id: "security", label: "Seguridad", icon: "🔒" },
              { id: "wallet", label: "Monedero", icon: "💳" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id as ActiveTab);
                  setShowPasswordForm(false);
                  setPasswordMessage(null);
                }}
                className={`px-6 py-3 mx-2 text-sm font-medium rounded-lg focus:outline-none transition-all duración-300 flex items-center space-x-2 ${activeTab === (tab.id as ActiveTab)
                  ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                  : "text-gray-600 hover:text-[#0F6899] hover:bg-gray-100"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido tabs */}
          <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
            {/* PERSONAL (se conserva igual que tenías) */}
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
                {/* ... (tus campos de personal tal como los tenías) */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nombre</label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.nombre || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, nombre: e.target.value })}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Apellido</label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.apellido || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, apellido: e.target.value })}
                  />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Género</label>
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
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nacionalidad</label>
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
                        <option key={country.value} value={country.value}>{country.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 w-full p-2 border rounded-lg bg-gray-50">
                      {getNationalityLabel(personalForm.nacionalidad)}
                    </div>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nombre de usuario</label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={personalForm.username || ""}
                    disabled={!editPersonal}
                    onChange={(e) => setPersonalForm({ ...personalForm, username: e.target.value })}
                  />
                </div>
                {/* Foto */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Foto de perfil</label>
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
                    <span className={`text-sm ${updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
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

            {/* CONTACT (igual que lo tenías) */}
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
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Correo electrónico</label>
                  <input
                    type="email"
                    className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-200 disabled:border-gray-300 disabled:cursor-not-allowed"
                    value={contactForm.correo || ""}
                    disabled={true}
                    onChange={(e) => setContactForm({ ...contactForm, correo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Dirección de facturación</label>
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border rounded-lg"
                    value={contactForm.direccion_facturacion || ""}
                    disabled={!editContact}
                    onChange={(e) => setContactForm({ ...contactForm, direccion_facturacion: e.target.value })}
                  />
                  <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                      Suscrito a noticias
                    </label>

                    <input
                      type="checkbox"
                      checked={!!contactForm.suscrito_noticias}
                      onChange={async (e) => {
                        const nuevoValor = e.target.checked;
                        setContactForm((prev: any) => ({ ...prev, suscrito_noticias: nuevoValor }));

                        try {
                          await api.patch("/profile", { suscrito_noticias: nuevoValor });
                          setUpdateMessage(
                            nuevoValor
                              ? "✅ Te has suscrito correctamente a las noticias."
                              : "❌ Has cancelado la suscripción a las noticias."
                          );
                        } catch (err: any) {
                          console.error("Error al actualizar suscripción:", err);
                          setUpdateMessage("⚠️ No se pudo actualizar la suscripción.");
                          // Revertir visualmente el cambio si falla
                          setContactForm((prev: any) => ({ ...prev, suscrito_noticias: !nuevoValor }));
                        }
                      }}
                      className="ml-2 w-5 h-5 accent-[#3B82F6] cursor-pointer"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-4 mt-4">
                  {updateMessage && (
                    <span className={`text-sm ${updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
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

            {/* SECURITY (igual que lo tenías) */}
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
                  try {
                    await api.patch("/profile", { password_bash: newPassword });
                    auth.logout();
                    navigate("/login");
                    setPasswordMessage("✅ Contraseña actualizada correctamente.");
                    setShowPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err: any) {
                    setPasswordMessage(err.response?.data?.message || "❌ No se pudo cambiar la contraseña.");
                  }
                }}
              >
                {!showPasswordForm ? (
                  <>
                    <p className="text-gray-600 mb-6 text-center">🔒 Por seguridad, tu contraseña no se muestra aquí.</p>
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
                        className={`p-4 rounded-lg text-sm text-center ${passwordMessage.startsWith("✅")
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                      >
                        {passwordMessage}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nueva contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Confirmar nueva contraseña</label>
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
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duración-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duración-300"
                      >
                        Guardar contraseña
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* WALLET — solo muestra saldoTotalUsuario + Añadir tarjeta */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                {/* Saldo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Saldo actual</p>
                    {walletLoading ? (
                      <p className="text-sm text-gray-500 mt-1">Cargando saldo…</p>
                    ) : walletError ? (
                      <p className="text-sm text-red-600 mt-1">{walletError}</p>
                    ) : (
                      <p className="text-3xl font-bold text-[#081225] mt-1">
                        {formatCOP(walletBalance)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddCard(true)}
                    className="px-4 py-2 rounded-lg bg-white border border-[#0F6899] text-[#0F6899] hover:bg-[#0F6899] hover:text-white transition"
                  >
                    Añadir tarjeta
                  </button>
                </div>

                {/* Feedback de guardado */}
                {addCardOk && (
                  <div className="text-sm rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2">
                    {addCardOk}
                  </div>
                )}

                {/* Métodos (UI local) */}
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
                              <p className="text-xs text-gray-500">Vence {pm.expMonth}/{pm.expYear}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {pm.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Predeterminada</span>
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

              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL AÑADIR TARJETA */}
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
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nombre en la tarjeta</label>
                  <input
                    type="text"
                    value={addCardForm.holder}
                    onChange={(e) => setAddCardForm((s) => ({ ...s, holder: e.target.value }))}
                    className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Número de tarjeta</label>
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
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Mes/Año</label>
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
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">CVC</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={addCardForm.cvc}
                      onChange={(e) => setAddCardForm((s) => ({ ...s, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="123"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Marca (UI)</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Banco</label>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      // HTML pattern por si usas validación nativa del form:
                      pattern="^[A-Za-zÀ-ÿ\s]+$"
                      value={addCardForm.banco}
                      onBeforeInput={(e: React.FormEvent<HTMLInputElement>) => {
                        // Evita inyectar caracteres inválidos antes de que entren al input
                        const data = (e as unknown as InputEvent).data ?? "";
                        if (data && !/^[A-Za-zÀ-ÿ\s]$/.test(data)) {
                          (e.nativeEvent as InputEvent).preventDefault();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Bloquea teclas numéricas (fila y keypad), pero permite navegación/edición
                        const allowedKeys = [
                          "Backspace", "Delete", "Tab", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"
                        ];
                        if (allowedKeys.includes(e.key)) return;
                        if (/^\d$/.test(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        // Valida pegado: solo letras y espacios
                        const text = e.clipboardData.getData("text");
                        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(text)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        // Filtro definitivo por si algo se cuela (ej. autocompletar)
                        const limpio = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
                        setAddCardForm((s) => ({ ...s, banco: limpio }));
                      }}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="Banco de Bogotá"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Tipo</label>
                    <select
                      value={addCardForm.tipo}
                      onChange={(e) => setAddCardForm((s) => ({ ...s, tipo: e.target.value as "credito" | "debito" }))}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="credito">Crédito</option>
                      <option value="debito">Débito</option>
                    </select>
                  </div>
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
                  disabled={!canSubmitCard || savingCard}
                  onClick={handleAddCard}
                  className={`px-4 py-2 rounded-lg text-white transition ${!canSubmitCard || savingCard
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                    }`}
                >
                  {savingCard ? "Guardando…" : "Guardar tarjeta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
