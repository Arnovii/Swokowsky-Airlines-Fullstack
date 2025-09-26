import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

export default function Perfil() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>();
  const [activeTab, setActiveTab] = useState<"personal" | "contact" | "security">("personal");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // Eliminado: const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  // Estados para edición
  const [editPersonal, setEditPersonal] = useState(false);
  const [editContact, setEditContact] = useState(false);
  // Campos editables
  const [personalForm, setPersonalForm] = useState<any>({});
  const [contactForm, setContactForm] = useState<any>({});
  // Ref para input file
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

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
      } catch (err) {
        console.error(err);
      }
    };
    getProfileInfo();
  }, []);

  // Elimina función no usada

  if (!profile) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100">
        {/* Cabecera moderna con foto y nombre */}
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
              <span className="bg-[#0F6899] text-white px-2 py-1 rounded-full text-xs ml-2">{profile.tipo_usuario}</span>
            )}
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex justify-center mb-8 bg-gray-50 rounded-lg p-2">
          {[
            { id: "personal", label: "Información personal", icon: "👤" },
            { id: "contact", label: "Información de contacto", icon: "📧" },
            { id: "security", label: "Seguridad", icon: "🔒" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setShowPasswordForm(false);
                setPasswordMessage(null);
              }}
              className={`px-6 py-3 mx-2 text-sm font-medium rounded-lg focus:outline-none transition-all duration-300 flex items-center space-x-2 ${activeTab === tab.id
                ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                : "text-gray-600 hover:text-[#0F6899] hover:bg-gray-100"
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de pestañas */}
        <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
          {activeTab === "personal" && (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              onSubmit={async (e) => {
                e.preventDefault();
                setUpdateMessage(null);
                // Solo enviar los campos modificados
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
                  // Actualizar perfil local
                  setProfile({ ...profile, ...toUpdate });
                } catch (err: any) {
                  setUpdateMessage(
                    err.response?.data?.message || "❌ Error al actualizar datos."
                  );
                }
              }}
            >
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
                <input
                  type="text"
                  className="mt-2 w-full p-2 border rounded-lg"
                  value={personalForm.nacionalidad || ""}
                  disabled={!editPersonal}
                  onChange={(e) => setPersonalForm({ ...personalForm, nacionalidad: e.target.value })}
                />
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
                  <span className={`text-sm ${updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{updateMessage}</span>
                )}
                {!editPersonal ? (
                  <button type="button" className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg" onClick={() => setEditPersonal(true)}>
                    Editar
                  </button>
                ) : (
                  <>
                    <button type="button" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={() => { setEditPersonal(false); setPersonalForm({ ...profile }); setUpdateMessage(null); }}>
                      Cancelar
                    </button>
                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg">
                      Guardar cambios
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

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
                  setUpdateMessage(
                    err.response?.data?.message || "❌ Error al actualizar datos."
                  );
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
              </div>
              <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Suscrito a noticias</label>
                <input
                  type="checkbox"
                  checked={!!contactForm.suscrito_noticias}
                  disabled={!editContact}
                  onChange={(e) => setContactForm({ ...contactForm, suscrito_noticias: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div className="col-span-2 flex justify-end items-center gap-4 mt-4">
                {updateMessage && (
                  <span className={`text-sm ${updateMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{updateMessage}</span>
                )}
                {!editContact ? (
                  <button type="button" className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg" onClick={() => setEditContact(true)}>
                    Editar
                  </button>
                ) : (
                  <>
                    <button type="button" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={() => { setEditContact(false); setContactForm({ ...profile }); setUpdateMessage(null); }}>
                      Cancelar
                    </button>
                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white rounded-lg">
                      Guardar cambios
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordMessage(null);
                // Validaciones
                if (newPassword.length < 8) {
                  setPasswordMessage("❌ La nueva contraseña debe tener al menos 8 caracteres.");
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPasswordMessage("❌ Las nuevas contraseñas no coinciden.");
                  return;
                }
                // Solo enviar si hay cambios
                if (!newPassword) {
                  setPasswordMessage("No hay cambios para actualizar.");
                  return;
                }
                try {
                  await api.patch("/profile", { password_bash: newPassword });
                  auth.logout();
                  navigate('/login');
                  setPasswordMessage("✅ Contraseña actualizada correctamente.");
                  setShowPasswordForm(false);
                  setCurrentPassword("");
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
                      className={`p-4 rounded-lg text-sm text-center ${passwordMessage.startsWith("✅")
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
        </div>
      </div>
    </div>
  );
}
