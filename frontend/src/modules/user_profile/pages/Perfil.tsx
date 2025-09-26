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
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-3xl">
        {/* Cabecera moderna con foto y nombre */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            <img
              src={profile.img_url || "https://via.placeholder.com/150"}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover shadow-lg"
            />
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-gray-800">
            {profile.nombre} {profile.apellido}
          </h1>
          <p className="text-sm text-gray-500">{profile.username}</p>
        </div>

        {/* Navegación por pestañas */}
        <div className="flex justify-center mb-8">
          {[
            { id: "personal", label: "Información personal" },
            { id: "contact", label: "Información de contacto" },
            { id: "security", label: "Seguridad" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setShowPasswordForm(false);
                setPasswordMessage(null);
              }}
              className={`px-4 py-2 mx-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de pestañas */}
        <div className="p-4 border rounded-b-lg bg-gray-50">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase text-gray-500">Nombre</label>
                <p className="mt-1 text-gray-800">{profile.nombre}</p>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500">Apellido</label>
                <p className="mt-1 text-gray-800">{profile.apellido}</p>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500">Género</label>
                <p className="mt-1 text-gray-800">{getGenero(profile.genero)}</p>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500">Fecha de nacimiento</label>
                <p className="mt-1 text-gray-800">
                  {new Date(profile.fecha_nacimiento).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500">Nacionalidad</label>
                <p className="mt-1 text-gray-800">{profile.nacionalidad}</p>
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500">Nombre de usuario</label>
                <p className="mt-1 text-gray-800">{profile.username}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase text-gray-500">Correo</label>
                <p className="mt-1 text-gray-800">{profile.correo}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase text-gray-500">
                  Dirección de facturación
                </label>
                <p className="mt-1 text-gray-800">{profile.direccion_facturacion}</p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              {!showPasswordForm ? (
                <>
                  <p className="text-gray-700 mb-4">
                    Por seguridad, tu contraseña no se muestra aquí.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Cambiar contraseña
                  </button>
                </>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordMessage && (
                    <div
                      className={`p-2 rounded-md text-sm text-center ${
                        passwordMessage.startsWith("✅")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {passwordMessage}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs uppercase text-gray-500">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-500">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-500">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordMessage(null);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
