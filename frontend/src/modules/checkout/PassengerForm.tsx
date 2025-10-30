import React, { useEffect, useState } from 'react';

const genderOptions = [
  { value: '', label: 'Género*' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'X', label: 'Otro' },
];




interface PassengerFormModernProps {
  index?: number;
  data: {
    gender: string;
    name: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    nationality: string;
    document: string;
    program: string;
  };
  onChange: (field: string, value: string) => void;
}

export type PassengerFormData = {
  gender: string;
  name: string;
  lastName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  nationality: string;
  document: string;
  program: string;
  age: number;
  dni: string;
};

const PassengerFormModern: React.FC<PassengerFormModernProps> = ({ index = 1, data, onChange }) => {
  const [nationalities, setNationalities] = useState<{ name: string; code: string }[]>([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
      .then((res) => res.json())
      .then((data: Array<{ name: { common: string }; cca2: string }>) => {
        const list = data.map((c) => ({ name: c.name.common, code: c.cca2 }));
        setNationalities(list);
      })
      .catch(() => {
        setNationalities([
          { name: "Argentina", code: "AR" },
          { name: "Brasil", code: "BR" },
          { name: "Chile", code: "CL" },
          { name: "Colombia", code: "CO" },
          { name: "México", code: "MX" },
          { name: "España", code: "ES" },
          { name: "Estados Unidos", code: "US" },
          { name: "Francia", code: "FR" },
          { name: "Italia", code: "IT" },
          { name: "Alemania", code: "DE" },
          { name: "Perú", code: "PE" },
          { name: "Uruguay", code: "UY" },
          { name: "Venezuela", code: "VE" },
        ]);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6 font-sans">
      <h2 className="text-xl font-semibold mb-6 font-sans text-[#081225]">Pasajero {index}:</h2>
      
      {/* Datos personales */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Datos personales</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
            value={data.gender}
            onChange={e => onChange('gender', e.target.value)}
          >
            {genderOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="text"
            className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
            placeholder="Nombre*"
            value={data.name}
            onChange={e => onChange('name', e.target.value)}
          />
          <input
            type="text"
            className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
            placeholder="Apellido*"
            value={data.lastName}
            onChange={e => onChange('lastName', e.target.value)}
          />
        </div>
      </div>
      
      {/* Fecha de nacimiento */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Fecha de nacimiento</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            className="border rounded-lg px-2 py-2 font-sans text-[#081225]"
            value={data.birthDay}
            onChange={e => onChange('birthDay', e.target.value)}
          >
            <option value="">Día</option>
            {[...Array(31)].map((_, i) => (
              <option key={i+1} value={String(i+1)}>{i+1}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-2 py-2 font-sans text-[#081225]"
            value={data.birthMonth}
            onChange={e => onChange('birthMonth', e.target.value)}
          >
            <option value="">Mes</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={String(i+1)}>{i+1}</option>
            ))}
          </select>
          <select
            className="border rounded-lg px-2 py-2 font-sans text-[#081225]"
            value={data.birthYear}
            onChange={e => onChange('birthYear', e.target.value)}
          >
            <option value="">Año</option>
            {[...Array(100)].map((_, i) => (
              <option key={2025-i} value={String(2025-i)}>{2025-i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-[#0F6899] to-[#39A5D8] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-black uppercase tracking-wide">Información adicional</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
            value={data.nationality}
            onChange={e => onChange('nationality', e.target.value)}
          >
            <option value="">Selecciona nacionalidad*</option>
            {nationalities.map(nac => (
              <option key={nac.code} value={nac.name}>{nac.name}</option>
            ))}
          </select>
          <input
            type="text"
            className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
            placeholder="Número de documento*"
            value={data.document}
            onChange={e => onChange('document', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerFormModern;
