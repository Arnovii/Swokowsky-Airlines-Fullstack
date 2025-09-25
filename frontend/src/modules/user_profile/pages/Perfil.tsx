// src/modules/user_profile/pages/Perfil.tsx (simplificado)
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";


interface Profile {
  id_usuario: number;
  tipo_usuario: "cliente" | "admin" | "root";
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;  // Si prefieres usar Date, puedes transformarlo luego en un Date
  nacionalidad: string;
  direccion_facturacion: string;
  genero: "M" | "F" | "X";  
  correo: string;
  username: string;
  img_url: string;
  suscrito_noticias: boolean;
  creado_en: string;  // Lo mismo con Date si prefieres transformar a tipo Date
  must_change_password: boolean;
}


export default function Perfil() {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const getProfileInfo = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
      } catch (err) {
        // if 401, axios won't redirect automatically — you can call auth.logout() on 401 if you want
        console.error(err);
      }
    };
    getProfileInfo();
  }, []);

  if (!profile) return <div>Cargando...</div>;
  return (
    <div>
      <h1>{profile.nombre} {profile.apellido}</h1>
      <p>{profile.correo}</p>
      <p>{profile.username}</p>
      {/* ... */}
    </div>
  );
}
