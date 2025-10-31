import { useState } from 'react';

interface TravelerInfo {
  documento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'Otro' | '';
  telefono: string;
  email: string;
  nombreContacto: string;
  telefonoContacto: string;
}

interface TravelerFormProps {
  index: number;
  data: TravelerInfo;
  onChange: (data: TravelerInfo) => void;
  flightInfo: {
    origin: string;
    destination: string;
    date: string;
  };
}

const TravelerForm: React.FC<TravelerFormProps> = ({ 
  index, 
  data, 
  onChange, 
  flightInfo 
}) => {
  const [touched, setTouched] = useState<Partial<Record<keyof TravelerInfo, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof TravelerInfo, string>>>({});

  const handleChange = (field: keyof TravelerInfo, value: string) => {
    onChange({ ...data, [field]: value });
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof TravelerInfo) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, data[field]);
  };

  const validateField = (field: keyof TravelerInfo, value: string) => {
    if (!touched[field] && !value) {
      return;
    }

    const trimmedValue = value?.trim() || '';
    let error = '';

    if (!trimmedValue) {
      error = 'Este campo es obligatorio';
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }

    switch (field) {
      case 'documento':
        if (!/^\d{6,15}$/.test(trimmedValue)) {
          error = 'El documento debe tener entre 6 y 15 dígitos';
        }
        break;

      case 'nombres':
      case 'apellidos':
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(trimmedValue)) {
          error = 'Solo letras y espacios entre palabras';
        }
        break;

      case 'fechaNacimiento':
        const date = new Date(trimmedValue);
        const now = new Date();
        if (isNaN(date.getTime())) {
          error = 'Fecha inválida';
        } else if (date > now) {
          error = 'La fecha no puede ser futura';
        } else {
          const age = now.getFullYear() - date.getFullYear();
          if (age < 0 || age > 120) {
            error = 'Edad no válida';
          }
        }
        break;

      case 'email':
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedValue)) {
          error = 'Correo electrónico inválido';
        }
        break;

      case 'telefono':
      case 'telefonoContacto':
        if (!/^\d{10}$/.test(trimmedValue)) {
          error = 'Debe tener 10 dígitos';
        }
        break;

      case 'nombreContacto':
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(trimmedValue)) {
          error = 'Solo letras y espacios';
        }
        break;

      case 'genero':
        if (!['M', 'F', 'Otro'].includes(trimmedValue)) {
          error = 'Selecciona un género válido';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#0F6899] to-[#39A5D8] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Pasajero {index}</h3>
            </div>
          </div>
          
          <div className="text-right text-white">
            <p className="text-sm text-white/80">Fecha de vuelo</p>
            <p className="font-semibold">{flightInfo.date}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.documento}
                onChange={(e) => handleChange('documento', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('documento')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.documento && errors.documento ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="123456789"
              />
              {touched.documento && errors.documento && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.documento}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                onBlur={() => handleBlur('nombres')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.nombres && errors.nombres ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="Juan Carlos"
              />
              {touched.nombres && errors.nombres && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombres}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                onBlur={() => handleBlur('apellidos')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.apellidos && errors.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="Pérez García"
              />
              {touched.apellidos && errors.apellidos && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.apellidos}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                onBlur={() => handleBlur('fechaNacimiento')}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.fechaNacimiento && errors.fechaNacimiento ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
              />
              {touched.fechaNacimiento && errors.fechaNacimiento && (
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
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none ${
                      data.genero === option.value
                        ? 'border-[#39A5D8] bg-[#39A5D8]/10 text-[#0F6899] font-semibold'
                        : 'border-gray-300 hover:border-[#39A5D8]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`genero-${index}`}
                      value={option.value}
                      checked={data.genero === option.value}
                      onChange={(e) => {
                        handleChange('genero', e.target.value);
                        setTouched(prev => ({ ...prev, genero: true }));
                      }}
                      className="hidden"
                    />
                    <span className="text-xl">{option.icon}</span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Información de Contacto
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.telefono}
                onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('telefono')}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.telefono && errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="3001234567"
              />
              {touched.telefono && errors.telefono && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.telefono}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.email && errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="juan.perez@email.com"
              />
              {touched.email && errors.email && (
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

        <div>
          <h4 className="text-lg font-bold text-[#0F6899] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Contacto de Emergencia
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.nombreContacto}
                onChange={(e) => handleChange('nombreContacto', e.target.value)}
                onBlur={() => handleBlur('nombreContacto')}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.nombreContacto && errors.nombreContacto ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="María López"
              />
              {touched.nombreContacto && errors.nombreContacto && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombreContacto}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.telefonoContacto}
                onChange={(e) => handleChange('telefonoContacto', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('telefonoContacto')}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39A5D8]/50 ${
                  touched.telefonoContacto && errors.telefonoContacto ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#39A5D8]'
                }`}
                placeholder="3009876543"
              />
              {touched.telefonoContacto && errors.telefonoContacto && (
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