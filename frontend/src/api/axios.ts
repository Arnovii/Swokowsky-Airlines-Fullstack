// src/api/axios.ts
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

/*
 * Configura una instancia de Axios con manejo de errores personalizado.
 *
 * Esta instancia añade el token de autenticación a cada petición y, además, se
 * asegura de que los errores devueltos por el backend se propaguen correctamente
 * a los consumidores (páginas, hooks, etc.). Algunos backends devuelven
 * respuestas 2xx aunque haya fallos en la operación, colocando un
 * `statusCode` y un `message` en el cuerpo de la respuesta. Este interceptor
 * detecta esos casos y rechaza la promesa para que el código del cliente los
 * trate como errores.
 */
const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 15000,
});

// Adjuntar el token desde localStorage si existe
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("swk_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignoramos posibles errores de localStorage
  }
  return config;
});

// Interceptor de respuesta para manejar correctamente estados anidados y 401
api.interceptors.response.use(
  (response: AxiosResponse) => {
    /*
     * Algunos endpoints devuelven 200/201 pero encapsulan un error en
     * `response.data.statusCode` o `response.data.status`. Si ese código es >= 400
     * rechazamos la promesa para que el manejador de errores del componente lo
     * procese con un catch.
     */
    const nestedStatus: number | undefined =
      // algunos backends usan statusCode, otros status
      (response.data && (response.data.statusCode ?? response.data.status)) as
        | number
        | undefined;
    if (
      typeof nestedStatus === "number" &&
      nestedStatus >= 400 &&
      nestedStatus < 600
    ) {
      // Creamos un error similar al de Axios para mantener compatibilidad con el
      // manejo de errores existente. No modificamos response.status porque
      // queremos preservar el valor devuelto por el servidor; en su lugar
      // simplemente rechazamos y el código consumidor puede acceder a
      // `error.response.data.statusCode` y `error.response.data.message`.
      return Promise.reject({ response });
    }
    return response;
  },
  (err: AxiosError) => {
    /*
     * Si el error tiene status 401 en la respuesta, forzamos el logout global
     * eliminando el token e informando al AuthProvider mediante un evento.
     */
    const status = err?.response?.status;
    if (status === 401) {
      try {
        // Limpiamos localStorage (evitamos loops)
        localStorage.removeItem("swk_token");
        localStorage.removeItem("swk_user");
      } catch (e) {
        // ignoramos posibles errores de localStorage
      }
      // Disparamos evento global que el AuthProvider escuchará
      window.dispatchEvent(new Event("swk_logout"));
    }
    return Promise.reject(err);
  }
);

export default api;
