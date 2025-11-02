import { useState, useEffect } from 'react';

export interface TravelerFormData {
  id_tipo_documento: number;
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

interface TravelerFormProps {
  index: number;
  initialData?: Partial<TravelerFormData>;
  onUpdate: (data: TravelerFormData) => void;
}

const TravelerForm: React.FC<TravelerFormProps> = ({ index, initialData = {}, onUpdate }) => {
  const [formData, setFormData] = useState<TravelerFormData>({
    id_tipo_documento: initialData.id_tipo_documento || 0,
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

  // Tipos de documento
  const documentTypes = [
    { id: 1, nombre: 'Cédula de Ciudadanía' },
    { id: 2, nombre: 'Cédula de Extranjería' },
    { id: 3, nombre: 'Pasaporte' },
    { id: 4, nombre: 'Tarjeta de Identidad' }
  ];

  // Validar campo individual
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'id_tipo_documento':
        return !value || value === 0 ? 'Selecciona un tipo de documento' : '';
      case 'numero_documento':
        return !value || value.trim() === '' ? 'El número de documento es requerido' : '';
      case 'primer_nombre':
        return !value || value.trim() === '' ? 'El primer nombre es requerido' : '';
      case 'primer_apellido':
        return !value || value.trim() === '' ? 'El primer apellido es requerido' : '';
      case 'fecha_nacimiento':
        if (!value) return 'La fecha de nacimiento es requerida';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 120) return 'Fecha de nacimiento inválida';
        return '';
      case 'genero':
        return !value ? 'Selecciona un género' : '';
      case 'email':
        if (!value || value.trim() === '') return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo electrónico inválido';
        return '';
      case 'contacto_nombre':
        return !value || value.trim() === '' ? 'El nombre del contacto es requerido' : '';
      case 'contacto_telefono':
        return !value || value.trim() === '' ? 'El teléfono del contacto es requerido' : '';
      default:
        return '';
    }
  };

  // Manejar cambio en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Validar el campo
      const error = validateField(name, value);
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
    return value !== '' && value !== 0 && value !== null && value !== undefined;
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
        {/* Tipo de Documento */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Tipo de Documento *
          </label>
          <select
            name="id_tipo_documento"
            value={formData.id_tipo_documento}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.id_tipo_documento 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('id_tipo_documento')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          >
            <option value={0}>Selecciona...</option>
            {documentTypes.map(type => (
              <option key={type.id} value={type.id}>{type.nombre}</option>
            ))}
          </select>
          {errors.id_tipo_documento && (
            <p className="text-red-500 text-xs mt-1">{errors.id_tipo_documento}</p>
          )}
        </div>

        {/* Número de Documento */}
        <div className="relative">
          <label className="block text-sm font-semibold text-[#123361] mb-2">
            Número de Documento *
          </label>
          <input
            type="text"
            name="numero_documento"
            value={formData.numero_documento}
            onChange={handleChange}
            placeholder="123456789"
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.numero_documento 
                ? 'border-red-400 focus:border-red-500' 
                : isFieldComplete('numero_documento')
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-300 focus:border-[#39A5D8]'
            } focus:outline-none transition-all duration-300`}
          />
          {errors.numero_documento && (
            <p className="text-red-500 text-xs mt-1">{errors.numero_documento}</p>
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
            Teléfono *
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+57 300 123 4567"
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
            Teléfono de Contacto de Emergencia *
          </label>
          <input
            type="tel"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            onChange={handleChange}
            placeholder="+57 300 987 6543"
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