import { useState } from 'react';
import type { TravelerInfo } from '../modules/checkout/types/checkoutTypes';

interface TravelerFormProps {
  index: number; // Número del pasajero (1, 2, 3...)
  data: TravelerInfo; // Datos actuales del viajero
  onChange: (data: TravelerInfo) => void; // Función que se ejecuta cuando cambian los datos
  flightInfo: {
    origin: string; // Código del aeropuerto de origen (ej: "BOG")
    destination: string; // Código del aeropuerto de destino (ej: "MDE")
    date: string; // Fecha del vuelo formateada
  };
}

const TravelerForm: React.FC<TravelerFormProps> = ({ 
  index, 
  data, 
  onChange, 
  flightInfo 
}) => {
  // Estado local para manejar errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof TravelerInfo, string>>>({});

  // Función para actualizar un campo específico
  const handleChange = (field: keyof TravelerInfo, value: string) => {
    onChange({ ...data, [field]: value });
    
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función para validar un campo cuando pierde el foco (onBlur)
  const validateField = (field: keyof TravelerInfo) => {
    const rawValue = data[field] ?? '';
    const value = rawValue.trim(); // ✨ elimina espacios al inicio y al final
    let error = '';

    // 1️⃣ Campo obligatorio
    if (!value) {
      error = 'Este campo es obligatorio';
    }

    // 2️⃣ No permitir comillas, símbolos raros ni caracteres de escape
    else if (/['"<>`´]/.test(value)) {
      error = 'Caracteres inválidos';
    }

    // 3️⃣ Validación de nombres y apellidos (solo letras, espacios y acentos válidos)
    else if (
      (field === 'nombres' || field === 'apellidos') &&
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(value)
    ) {
      error = 'Solo se permiten letras y un espacio entre palabras';
    }

    // 4️⃣ Validación de documento (solo números, sin espacios ni letras)
    else if (field === 'documento' && !/^\d{6,15}$/.test(value)) {
      error = 'El documento debe tener entre 6 y 15 dígitos numéricos';
    }

    // 5️⃣ Validación de fecha de nacimiento (no vacía ni futura)
    else if (field === 'fecha_nacimiento') {
      const date = new Date(value);
      const now = new Date();

      if (isNaN(date.getTime())) {
        error = 'Fecha inválida';
      } else if (date > now) {
        error = 'La fecha no puede ser futura';
      } else {
        const age = now.getFullYear() - date.getFullYear();
        if (age < 0 || age > 120) {
          error = 'Fecha de nacimiento no válida';
        }
      }
    }

    // 6️⃣ Validación de género (solo opciones válidas)
    else if (field === 'genero' && !['masculino', 'femenino', 'otro'].includes(value.toLowerCase())) {
      error = 'Selecciona un género válido';
    }

    // 7️⃣ Validación de email (sin espacios, formato correcto)
    else if (field === 'email') {
      if (/\s/.test(value)) {
        error = 'El correo no puede contener espacios';
      } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        error = 'Correo electrónico inválido';
      }
    }

    // 8️⃣ Teléfonos (solo 10 dígitos, sin símbolos ni letras)
    else if ((field === 'telefono' || field === 'contacto_telefono') && !/^\d{10}$/.test(value)) {
      error = 'Debe tener exactamente 10 dígitos numéricos';
    }

    // 9️⃣ Nombre del contacto (solo letras y espacios)
    else if (field === 'contacto_nombre' && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(value)) {
      error = 'Solo se permiten letras en el nombre del contacto';
    }

    // 🔟 Validación general contra entradas tipo "    " o símbolos
    else if (/^\s*$/.test(rawValue)) {
      error = 'No puede contener solo espacios';
    }

    // 🧩 Validación de longitud general (por seguridad)
    else if (value.length > 100) {
      error = 'El valor es demasiado largo';
    }

    // ✅ Actualizamos estado de errores
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };



  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* ==================== HEADER - Información del vuelo ==================== */}
      <div className="bg-gradient-to-r from-[#0F6899] to-[#39A5D8] p-6">
        <div className="flex items-center justify-between">
          {/* Información del pasajero */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Pasajero </h3>
              <p className="text-white/80 text-sm">{flightInfo.origin} → {flightInfo.destination}</p>
            </div>
          </div>
          
          {/* Fecha del vuelo */}
          <div className="text-right text-white">
            <p className="text-sm text-white/80">Fecha de vuelo</p>
            <p className="font-semibold">{flightInfo.date}</p>
          </div>
        </div>
      </div>

      {/* ==================== FORMULARIO ==================== */}
      <div className="p-6 space-y-6">
        
        {/* ========== SECCIÓN 1: Información Personal ========== */}
        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            {/* Campo: Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                onBlur={() => validateField('documento')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.documento ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="123456789"
              />
              {errors.documento && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.documento}
                </p>
              )}
            </div>

            {/* Campo: Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                onBlur={() => validateField('nombres')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.nombres ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="Juan Carlos"
              />
              {errors.nombres && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombres}
                </p>
              )}
            </div>

            {/* Campo: Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                onBlur={() => validateField('apellidos')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="Pérez García"
              />
              {errors.apellidos && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.apellidos}
                </p>
              )}
            </div>

            {/* Campo: Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                onBlur={() => validateField('fechaNacimiento')}
                max={new Date().toISOString().split('T')[0]} // No permite fechas futuras
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.fechaNacimiento ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
              />
              {errors.fechaNacimiento && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.fechaNacimiento}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-4">
                {[
                  { value: 'M', label: 'Masculino', icon: '♂' },
                  { value: 'F', label: 'Femenino', icon: '♀' },
                  { value: 'Otro', label: 'Otro', icon: '⚥' }
                ].map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`genero-${option.value}`} // 💡 Vinculamos el label con el input
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none ${
                      data.genero === option.value
                        ? 'border-[#39A5D8] bg-[#39A5D8]/10 text-[#0F6899] font-semibold'
                        : 'border-gray-300 hover:border-[#39A5D8]/50'
                    }`}
                  >
                    <input
                      id={`genero-${option.value}`} // 💡 ID único por opción
                      type="radio"
                      name={`genero-${index}`} // 🔹 Para que solo uno se pueda seleccionar por pasajero
                      value={option.value}
                      checked={data.genero === option.value}
                      onChange={(e) => handleChange('genero', e.target.value as 'M' | 'F' | 'Otro')}
                      className="hidden" // 🔹 Usa "hidden" mejor que "sr-only"
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              {errors.genero && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.genero}
                </p>
              )}
            </div>

          </div>
        </div>





        {/* ========== SECCIÓN 2: Información de Contacto ========== */}
        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Información de Contacto
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Campo: Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.telefono}
                onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))} // Solo números
                onBlur={() => validateField('telefono')}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="3001234567"
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.telefono}
                </p>
              )}
            </div>

            {/* Campo: Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => validateField('email')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="juan.perez@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ========== SECCIÓN 3: Contacto de Emergencia ========== */}
        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Contacto de Emergencia
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Campo: Nombre del Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.nombreContacto}
                onChange={(e) => handleChange('nombreContacto', e.target.value)}
                onBlur={() => validateField('nombreContacto')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.nombreContacto ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="María López"
              />
              {errors.nombreContacto && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombreContacto}
                </p>
              )}
            </div>

            {/* Campo: Teléfono del Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.telefonoContacto}
                onChange={(e) => handleChange('telefonoContacto', e.target.value.replace(/\D/g, ''))} // Solo números
                onBlur={() => validateField('telefonoContacto')}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  errors.telefonoContacto ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="3009876543"
              />
              {errors.telefonoContacto && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.telefonoContacto}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerForm;
