import type { Pasajero } from '../services/checkoutService';
import type { TravelerFormData } from '../components/TravelerForm';

/**
 * Validar formulario de pasajero (TravelerFormData)
 */
export const validateTravelerForm = (data: TravelerFormData): boolean => {
  return (
    !!data.numero_documento &&
    data.numero_documento.trim() !== '' &&
    /^\d{8,10}$/.test(data.numero_documento.trim()) &&
    !!data.primer_nombre &&
    data.primer_nombre.trim() !== '' &&
    !!data.primer_apellido &&
    data.primer_apellido.trim() !== '' &&
    !!data.fecha_nacimiento &&
    data.fecha_nacimiento.trim() !== '' &&
    !!data.genero &&
    !!data.email &&
    data.email.trim() !== '' &&
    !!data.telefono &&
    data.telefono.trim() !== '' &&
    !!data.contacto_nombre &&
    data.contacto_nombre.trim() !== '' &&
    !!data.contacto_telefono &&
    data.contacto_telefono.trim() !== ''
  );
};

/**
 * Mapear TravelerFormData al formato de la API (Pasajero)
 */
export const mapTravelerToApi = (data: TravelerFormData): Pasajero => {
  return {
    nombre: data.primer_nombre,
    apellido: data.primer_apellido,
    dni: data.numero_documento,
    phone: data.telefono || '',
    email: data.email,
    contact_name: data.contacto_nombre,
    phone_name: data.contacto_telefono,
    genero: data.genero === 'O' ? 'X' : data.genero, // 'O' del form → 'X' de la DB
    fecha_nacimiento: data.fecha_nacimiento
  };
};

/**
 * Validar información completa de un pasajero
 */
export const validatePasajero = (pasajero: Pasajero): boolean => {
  const requiredFields: (keyof Pasajero)[] = [
    'dni',           // Documento
    'nombre',        // Nombres
    'apellido',      // Apellidos
    'fecha_nacimiento', // Fecha de nacimiento
    'genero',        // Género
    'phone',         // Teléfono
    'email'          // Correo electrónico
  ];

  // Verificar que todos los campos requeridos estén llenos
  const allFieldsFilled = requiredFields.every(field => {
    const value = pasajero[field];
    return value !== null && value !== undefined && value.toString().trim() !== '';
  });

  if (!allFieldsFilled) return false;

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(pasajero.email)) return false;

  // Validar teléfono (formato internacional o nacional)
  const phoneRegex = /^(\+\d{1,3})?\d{10,15}$/;
  if (!phoneRegex.test(pasajero.phone.replace(/\s/g, ''))) return false;

  // Validar teléfono de contacto si está presente
  if (pasajero.phone_name && !phoneRegex.test(pasajero.phone_name.replace(/\s/g, ''))) {
    return false;
  }

  // Validar DNI (mínimo 6 caracteres)
  if (pasajero.dni.length < 6) return false;

  // Validar género
  if (!['M', 'F', 'Otro'].includes(pasajero.genero)) return false;

  // Validar fecha de nacimiento
  const birthDate = new Date(pasajero.fecha_nacimiento);
  const now = new Date();
  if (isNaN(birthDate.getTime()) || birthDate > now) return false;

  const age = now.getFullYear() - birthDate.getFullYear();
  if (age < 1 || age > 120) return false;

  return true;
};

/**
 * Validar un campo específico de pasajero
 */
export const validateField = (field: keyof Pasajero, value: string): string => {
  const trimmedValue = value?.trim() || '';

  // Campos opcionales
  if ((field === 'contact_name' || field === 'phone_name') && !trimmedValue) {
    return ''; // No es error si está vacío
  }

  // Campos obligatorios
  if (!trimmedValue && field !== 'contact_name' && field !== 'phone_name') {
    return 'Este campo es obligatorio';
  }

  switch (field) {
    case 'dni': // Documento
      if (!/^\d{8,10}$/.test(trimmedValue)) {
        return 'El documento debe tener entre 8 y 10 dígitos';
      }
      break;

    case 'nombre': // Nombres (sin espacios, solo letras)
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(trimmedValue)) {
        return 'Solo se permiten letras, sin números ni espacios';
      }
      if (trimmedValue.length < 2) {
        return 'Debe tener al menos 2 caracteres';
      }
      if (trimmedValue.length > 50) {
        return 'Máximo 50 caracteres';
      }
      break;

    case 'apellido': // Apellidos (sin espacios, solo letras)
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(trimmedValue)) {
        return 'Solo se permiten letras, sin números ni espacios';
      }
      if (trimmedValue.length < 2) {
        return 'Debe tener al menos 2 caracteres';
      }
      if (trimmedValue.length > 50) {
        return 'Máximo 50 caracteres';
      }
      break;

    case 'contact_name': // Nombre de contacto (sin espacios, solo letras)
      if (trimmedValue && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(trimmedValue)) {
        return 'Solo se permiten letras, sin números ni espacios';
      }
      if (trimmedValue && trimmedValue.length < 2) {
        return 'Debe tener al menos 2 caracteres';
      }
      break;

    case 'fecha_nacimiento': { // Fecha de nacimiento
      const date = new Date(trimmedValue);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        return 'Fecha no válida';
      }
      if (date > now) {
        return 'La fecha no puede ser futura';
      }
      
      const age = now.getFullYear() - date.getFullYear();
      const monthDiff = now.getMonth() - date.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate()) 
        ? age - 1 
        : age;

      if (adjustedAge < 1) {
        return 'El pasajero debe tener al menos 1 año';
      }
      if (adjustedAge > 120) {
        return 'Edad no válida (máximo 120 años)';
      }
      break;
    }

    case 'email': // Correo electrónico
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedValue)) {
        return 'Correo electrónico inválido';
      }
      break;

    case 'phone': { // Teléfono
      // Formato colombiano: exactamente 10 dígitos
      const cleanPhone = trimmedValue.replace(/\s/g, '');
      if (!/^\d{10}$/.test(cleanPhone)) {
        return 'El teléfono debe tener exactamente 10 dígitos';
      }
      break;
    }

    case 'phone_name': { // Teléfono del contacto (opcional)
      if (trimmedValue) {
        const cleanContactPhone = trimmedValue.replace(/\s/g, '');
        if (!/^\d{10}$/.test(cleanContactPhone)) {
          return 'El teléfono debe tener exactamente 10 dígitos';
        }
      }
      break;
    }

    case 'genero': // Género
      if (!['M', 'F', 'Otro'].includes(trimmedValue)) {
        return 'Selecciona un género válido';
      }
      break;
  }

  return '';
};

/**
 * Validar email específicamente
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validar teléfono específicamente
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.trim().replace(/\s/g, '');
  const phoneRegex = /^(\+\d{1,3})?\d{10,15}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validar DNI/Documento específicamente
 */
export const validateDNI = (dni: string): boolean => {
  return /^\d{6,15}$/.test(dni.trim());
};

/**
 * Validar fecha de nacimiento específicamente
 */
export const validateBirthDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return false;
  if (date > now) return false;
  
  const age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const adjustedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate()) 
    ? age - 1 
    : age;
  
  return adjustedAge >= 1 && adjustedAge <= 120;
};

/**
 * Validar nombre (nombres o apellidos)
 */
export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(trimmedName) && 
         trimmedName.length >= 2 && 
         trimmedName.length <= 50;
};