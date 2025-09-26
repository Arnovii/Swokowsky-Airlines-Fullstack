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
  password?: string; // opcional, solo para UI
}

export default function Perfil() {
  const [profile, setProfile] = useState<Profile>();

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        {/* Encabezado con foto */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={profile.img_url || "https://via.placeholder.com/150"}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full shadow-md object-cover mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {profile.nombre} {profile.apellido}
          </h1>
          <p className="text-gray-500">{profile.correo}</p>
        </div>

        {/* Formulario de perfil en modo "solo lectura" */}
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

          {/* DNI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">DNI</label>
            <input
              type="text"
              value={profile.dni}
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

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

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

        {/* Botón editar */}
        <div className="mt-6 text-center">
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Editar perfil
          </button>
        </div>
      </div>
    </div>
  );
}
