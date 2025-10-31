// src/modules/checkout/utils/validations.ts

import type { TravelerInfo } from '../../../types/checkout';

export const validateTravelerInfo = (info: TravelerInfo): boolean => {
  const requiredFields: (keyof TravelerInfo)[] = [
    'documento',
    'nombres',
    'apellidos',
    'fecha_nacimiento',
    'genero',
    'telefono',
    'email',
    'contacto_nombre',
    'contacto_telefono'
  ];

  // Verificar que todos los campos requeridos estén llenos
  const allFieldsFilled = requiredFields.every(field => {
    const value = info[field];
    return value !== null && value !== undefined && value.toString().trim() !== '';
  });

  if (!allFieldsFilled) return false;

  // Validaciones específicas
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(info.email)) return false;

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(info.telefono) || !phoneRegex.test(info.contacto_telefono)) return false;

  if (info.documento.length < 6) return false;

  return true;
};

export const validateField = (field: keyof TravelerInfo, value: string): string => {
  const trimmedValue = value?.trim() || '';

  if (!trimmedValue) {
    return 'Este campo es obligatorio';
  }

  switch (field) {
    case 'documento':
      if (!/^\d{6,15}$/.test(trimmedValue)) {
        return 'El documento debe tener entre 6 y 15 dígitos';
      }
      break;

    case 'nombres':
    case 'apellidos':
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(trimmedValue)) {
        return 'Solo letras y espacios entre palabras';
      }
      break;

    case 'fecha_nacimiento':
      const date = new Date(trimmedValue);
      const now = new Date();
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      } else if (date > now) {
        return 'La fecha no puede ser futura';
      } else {
        const age = now.getFullYear() - date.getFullYear();
        if (age < 0 || age > 120) {
          return 'Edad no válida';
        }
      }
      break;

    case 'email':
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedValue)) {
        return 'Correo electrónico inválido';
      }
      break;

    case 'telefono':
    case 'contacto_telefono':
      if (!/^\d{10}$/.test(trimmedValue)) {
        return 'Debe tener 10 dígitos';
      }
      break;

    case 'contacto_nombre':
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(trimmedValue)) {
        return 'Solo letras y espacios';
      }
      break;

    case 'genero':
      if (!['Masculino', 'Femenino', 'Otro'].includes(trimmedValue)) {
        return 'Selecciona un género válido';
      }
      break;
  }

  return '';
};