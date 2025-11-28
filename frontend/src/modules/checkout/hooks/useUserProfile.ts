import { useState, useEffect } from 'react';
import api from '../../../api/axios';

export interface UserProfileData {
  id_usuario: number;
  dni: number | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  nacionalidad: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  correo: string;
  username: string;
}

/**
 * Hook para obtener el perfil del usuario autenticado.
 * Se usa para autocompletar datos en el formulario de pasajeros.
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    api.get('/profile')
      .then(res => {
        if (isMounted) {
          setProfile(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error al obtener perfil:', err?.response?.data || err.message);
          setProfile(null);
          setLoading(false);
        }
      });
      
    return () => { isMounted = false; };
  }, []);

  return { profile, loading };
}
