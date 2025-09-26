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
  password?: string;
}

// Devuelve el texto legible para el género
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
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'security'>('personal');

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

  if (!profile) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        {/* Encabezado con foto y nombre */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={profile.img_url || "https://via.placeholder.com/150"}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full shadow-md object-cover mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">
            {profile.nombre} {profile.apellido}
          </h1>
        </div>

        {/* Pestañas */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 -mb-px font-medium text-sm focus:outline-none ${activeTab === 'personal' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Información personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 -mb-px font-medium text-sm focus:outline-none ${activeTab === 'contact' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Información de contacto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 -mb-px font-medium text-sm focus:outline-none ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Seguridad
          </button>
        </div>

        {/* Contenido de cada pestaña */}
        {activeTab === 'personal' && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={profile.nombre}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                value={profile.apellido}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Género</label>
              <input
                type="text"
                value={getGenero(profile.genero)}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Fecha nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input
                type="text"
                value={new Date(profile.fecha_nacimiento).toLocaleDateString()}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Nacionalidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
              <input
                type="text"
                value={profile.nacionalidad}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </form>
        )}
        {activeTab === 'contact' && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="text"
                value={profile.correo}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            {/* Dirección facturación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección de facturación</label>
              <input
                type="text"
                value={profile.direccion_facturacion}
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </form>
        )}
        {activeTab === 'security' && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                value="********"
                disabled
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </form>
        )}
        {/*
         * Botón de acción: solo se muestra en la pestaña de seguridad.
         * Permite al usuario cambiar su contraseña. Al hacer clic, puede abrir un modal o
         * redirigir a una pantalla de cambio de contraseña (dependerá de tu flujo).
         */}
        {activeTab === 'security' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Cambiar contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}