import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export interface TravelerFormData {
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F' | 'O';
  nacionalidad: string;
  email: string;
  telefono?: string;
  contacto_nombre: string;
  contacto_telefono: string;
}

// Interfaz para los datos del perfil del usuario autenticado
export interface AuthUserProfile {
  dni: number | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  nacionalidad: string | null;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  correo: string;
}

interface TravelerFormProps {
  index: number;
  initialData?: Partial<TravelerFormData>;
  onUpdate: (data: TravelerFormData) => void;
  duplicateDocuments?: string[];
  /** Datos del perfil del usuario autenticado para autocompletar */
  authUserProfile?: AuthUserProfile | null;
}

const TravelerForm: React.FC<TravelerFormProps> = ({ index, initialData = {}, onUpdate, duplicateDocuments, authUserProfile }) => {
  // Ref para evitar mostrar el toast de autocompletado múltiples veces
  const hasAutocompletedRef = useRef(false);
  
  const [formData, setFormData] = useState<TravelerFormData>({
    numero_documento: initialData.numero_documento || '',
    primer_nombre: initialData.primer_nombre || '',
    segundo_nombre: initialData.segundo_nombre || '',
    primer_apellido: initialData.primer_apellido || '',
    segundo_apellido: initialData.segundo_apellido || '',
    fecha_nacimiento: initialData.fecha_nacimiento || '',
    genero: initialData.genero || 'M',
    nacionalidad: initialData.nacionalidad || 'CO',
    email: initialData.email || '',
    telefono: initialData.telefono || '',
    contacto_nombre: initialData.contacto_nombre || '',
    contacto_telefono: initialData.contacto_telefono || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Marcar error si el documento está repetido
  const isDuplicateDocument = !!(
    duplicateDocuments &&
    formData.numero_documento &&
    duplicateDocuments.includes(formData.numero_documento.trim())
  );

  // Función para mapear género del perfil al formato del formulario
  const mapGenderFromProfile = useCallback((genero: 'masculino' | 'femenino' | 'otro' | null): 'M' | 'F' | 'O' => {
    if (!genero) return 'M';
    switch (genero.toLowerCase()) {
      case 'masculino': return 'M';
      case 'femenino': return 'F';
      case 'otro': return 'O';
      default: return 'M';
    }
  }, []);

  // Función para formatear fecha del perfil al formato del formulario (YYYY-MM-DD)
  const formatDateFromProfile = useCallback((fecha: string | null): string => {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, []);

  // Autocompletar cuando la cédula coincide con la del usuario autenticado
  useEffect(() => {
    // Solo autocompletar si:
    // 1. Hay datos del perfil del usuario autenticado
    // 2. La cédula ingresada tiene entre 8 y 10 dígitos
    // 3. La cédula coincide con la del usuario autenticado
    // 4. No se ha autocompletado previamente para esta cédula
    if (
      authUserProfile?.dni &&
      formData.numero_documento.length >= 8 &&
      formData.numero_documento.length <= 10 &&
      formData.numero_documento === String(authUserProfile.dni) &&
      !hasAutocompletedRef.current
    ) {
      // Marcar que ya se autocompletó para esta cédula
      hasAutocompletedRef.current = true;
      
      // Separar apellidos (asume que están separados por espacio)
      const apellidos = (authUserProfile.apellido || '').trim().split(/\s+/);
      const primerApellido = apellidos[0] || '';
      const segundoApellido = apellidos.slice(1).join(' ') || '';
      
      // Separar nombres (asume que están separados por espacio)
      const nombres = (authUserProfile.nombre || '').trim().split(/\s+/);
      const primerNombre = nombres[0] || '';
      const segundoNombre = nombres.slice(1).join(' ') || '';
      
      // Autocompletar los campos con los datos del perfil
      setFormData(prev => ({
        ...prev,
        primer_nombre: primerNombre || prev.primer_nombre,
        segundo_nombre: segundoNombre || prev.segundo_nombre,
        primer_apellido: primerApellido || prev.primer_apellido,
        segundo_apellido: segundoApellido || prev.segundo_apellido,
        fecha_nacimiento: formatDateFromProfile(authUserProfile.fecha_nacimiento) || prev.fecha_nacimiento,
        genero: mapGenderFromProfile(authUserProfile.genero),
        nacionalidad: authUserProfile.nacionalidad || prev.nacionalidad || 'CO',
        email: authUserProfile.correo || prev.email,
      }));

      // Mostrar toast de éxito
      toast.success('✅ Datos autocompletados con tu información de perfil', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
    
    // Si la cédula cambió y ya no coincide, resetear el ref
    if (
      authUserProfile?.dni &&
      formData.numero_documento !== String(authUserProfile.dni)
    ) {
      hasAutocompletedRef.current = false;
    }
  }, [formData.numero_documento, authUserProfile, mapGenderFromProfile, formatDateFromProfile]);

  // Si el documento está repetido, forzar el error en el campo
  useEffect(() => {
    if (isDuplicateDocument) {
      setErrors(prev => ({ ...prev, numero_documento: 'Este número de documento ya está usado por otro pasajero' }));
    } else if (errors.numero_documento === 'Este número de documento ya está usado por otro pasajero') {
      setErrors(prev => {
        const { numero_documento, ...rest } = prev;
        return rest;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuplicateDocument, formData.numero_documento]);

  // Validar campo individual
  const validateField = (name: string, value: unknown): string => {
    switch (name) {
      case 'numero_documento':
        if (!value || String(value).trim() === '') return 'El número de documento es requerido';
        if (!/^\d{8,10}$/.test(String(value))) return 'El documento debe tener entre 8 y 10 dígitos';
        return '';
      case 'primer_nombre':
        return !value || String(value).trim() === '' ? 'El primer nombre es requerido' : '';
      case 'primer_apellido':
        return !value || String(value).trim() === '' ? 'El primer apellido es requerido' : '';
      case 'fecha_nacimiento': {
        if (!value) return 'La fecha de nacimiento es requerida';
        const birthDate = new Date(String(value));
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 120) return 'Fecha de nacimiento inválida';
        return '';
      }
      case 'genero':
        return !value ? 'Selecciona un género' : '';
      case 'email':
        if (!value || String(value).trim() === '') return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return 'Correo electrónico inválido';
        return '';
      case 'contacto_nombre':
        return !value || String(value).trim() === '' ? 'El nombre del contacto es requerido' : '';
      case 'telefono':
        if (!value || String(value).trim() === '') return 'El teléfono es requerido';
        if (!/^\d{10}$/.test(String(value))) return 'El teléfono debe tener exactamente 10 dígitos';
        return '';
      case 'contacto_telefono':
        if (!value || String(value).trim() === '') return 'El teléfono del contacto es requerido';
        if (!/^\d{10}$/.test(String(value))) return 'El teléfono debe tener exactamente 10 dígitos';
        return '';
      default:
        return '';
    }
  };

  // Sanitizar entrada según el tipo de campo
  const sanitizeInput = (name: string, value: string): string => {
    switch (name) {
      case 'primer_nombre':
      case 'segundo_nombre':
      case 'primer_apellido':
      case 'segundo_apellido':
      case 'contacto_nombre':
        // Solo letras (incluye letras con tildes y ñ), sin números ni caracteres especiales
        return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');
      
      case 'numero_documento':
        // Solo números, sin letras ni caracteres especiales (máximo 10, mínimo 8 para validación)
        return value.replace(/[^0-9]/g, '').slice(0, 10);
      
      case 'telefono':
      case 'contacto_telefono':
        // Solo números, sin + ni otros caracteres (máximo 10 dígitos)
        return value.replace(/[^0-9]/g, '').slice(0, 10);
      
      case 'email':
        // Permitir letras, números, @ . _ - (caracteres válidos en email)
        return value.replace(/[^a-zA-Z0-9@._-]/g, '');
      
      default:
        return value;
    }
  };

  // Manejar cambio en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sanitizar el valor según el tipo de campo
    const sanitizedValue = sanitizeInput(name, value);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: sanitizedValue };
      
      // Validar el campo
      const error = validateField(name, sanitizedValue);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));

      

      return newData;
    });
  };

  // Validar formulario completo al cargar datos iniciales
  useEffect(() => {
    // Solo notifica si no hay errores en los campos obligatorios
    const hasErrors = Object.values(errors).some(e => !!e);
    if (!hasErrors) {
      onUpdate(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const isFieldComplete = (fieldName: keyof TravelerFormData): boolean => {
    const value = formData[fieldName];
    return value !== '' && value !== null && value !== undefined;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-[#39A5D8]/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">{index}</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent">
            PASAJERO {index}
          </h3>
          <p className="text-sm text-gray-600 font-medium">
            Completa todos los campos requeridos
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número de Documento */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Número de Documento (8-10 dígitos) *
          </label>
          <input
            type="text"
            name="numero_documento"
            value={formData.numero_documento}
            onChange={handleChange}
            placeholder="12345678"
            maxLength={10}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.numero_documento || isDuplicateDocument
                ? 'border-red-400 focus:border-red-500'
                : isFieldComplete('numero_documento')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {(errors.numero_documento || isDuplicateDocument) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.numero_documento || (isDuplicateDocument && 'Este número de documento ya está usado por otro pasajero')}
            </p>
          )}
        </div>

        {/* Primer Nombre */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Primer Nombre *
          </label>
          <input
            type="text"
            name="primer_nombre"
            value={formData.primer_nombre}
            onChange={handleChange}
            placeholder="Juan"
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.primer_nombre 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('primer_nombre')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.primer_nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.primer_nombre}</p>
          )}
        </div>

        {/* Segundo Nombre */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Segundo Nombre
          </label>
          <input
            type="text"
            name="segundo_nombre"
            value={formData.segundo_nombre}
            onChange={handleChange}
            placeholder="Carlos"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#39A5D8] focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Primer Apellido */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Primer Apellido *
          </label>
          <input
            type="text"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            placeholder="Pérez"
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.primer_apellido 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('primer_apellido')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.primer_apellido && (
            <p className="text-red-500 text-xs mt-1">{errors.primer_apellido}</p>
          )}
        </div>

        {/* Segundo Apellido */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Segundo Apellido
          </label>
          <input
            type="text"
            name="segundo_apellido"
            value={formData.segundo_apellido}
            onChange={handleChange}
            placeholder="García"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#39A5D8] focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.fecha_nacimiento 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('fecha_nacimiento')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.fecha_nacimiento && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</p>
          )}
        </div>

        {/* Género */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Género *
          </label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.genero 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('genero')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          {errors.genero && (
            <p className="text-red-500 text-xs mt-1">{errors.genero}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative md:col-span-2">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.email 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('email')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Teléfono (10 dígitos) *
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="3001234567"
            maxLength={10}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.telefono 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('telefono')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.telefono && (
            <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
          )}
        </div>

        {/* Nombre de contacto de emergencia */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Nombre de Contacto de Emergencia *
          </label>
          <input
            type="text"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={handleChange}
            placeholder="Nombre completo"
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.contacto_nombre 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('contacto_nombre')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.contacto_nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.contacto_nombre}</p>
          )}
        </div>

        {/* Teléfono de contacto de emergencia */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Teléfono de Contacto de Emergencia (10 dígitos) *
          </label>
          <input
            type="tel"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            onChange={handleChange}
            placeholder="3009876543"
            maxLength={10}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.contacto_telefono 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('contacto_telefono')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.contacto_telefono && (
            <p className="text-red-500 text-xs mt-1">{errors.contacto_telefono}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelerForm;