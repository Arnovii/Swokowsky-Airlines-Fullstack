import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

interface Profile {
  id_usuario: number;
  dni: string;
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
  const [profile, setProfile] = useState<Profile>();
  const [activeTab, setActiveTab] = useState<"personal" | "contact" | "security">(
    "personal"
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    const getProfileInfo = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getProfileInfo();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
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
      // Suponiendo que exista un endpoint /auth/change-password
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setPasswordMessage("✅ Contraseña cambiada correctamente.");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage(
        err.response?.data?.message || "❌ No se pudo cambiar la contraseña."
      );
    }
  };

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
          <p className="text-sm text-[#3B82F6] mt-2 font-medium">@{profile.username}</p>
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

        {/* Contenido de pestañas */}
        <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nombre</label>
                <p className="mt-2 text-gray-800 text-lg">{profile.nombre}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Apellido</label>
                <p className="mt-2 text-gray-800 text-lg">{profile.apellido}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Género</label>
                <p className="mt-2 text-gray-800 text-lg">{getGenero(profile.genero)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Fecha de nacimiento</label>
                <p className="mt-2 text-gray-800 text-lg">
                  {new Date(profile.fecha_nacimiento).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nacionalidad</label>
                <p className="mt-2 text-gray-800 text-lg">{profile.nacionalidad}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">Nombre de usuario</label>
                <p className="mt-2 text-gray-800 text-lg">{profile.username}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                  Correo electrónico
                </label>
                <p className="mt-2 text-gray-800 text-lg flex items-center">
                  <span className="mr-2">📧</span>
                  {profile.correo}
                </p>
              </div>
              <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                <label className="block text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
                  Dirección de facturación
                </label>
                <p className="mt-2 text-gray-800 text-lg flex items-start">
                  <span className="mr-2 mt-1">📍</span>
                  {profile.direccion_facturacion}
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
                <form onSubmit={handleChangePassword} className="space-y-6">
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
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-300"
                      required
                    />
                  </div>
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
                        setCurrentPassword("");
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
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
