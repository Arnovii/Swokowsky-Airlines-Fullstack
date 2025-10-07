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
      <h2 className="text-xl font-semibold mb-4 font-sans text-[#081225]">Pasajero {index}:</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex gap-2">
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
        <select
          className="border rounded-lg px-3 py-2 font-sans text-[#081225]"
          value={data.nationality}
          onChange={e => onChange('nationality', e.target.value)}
        >
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
  );
};

export default PassengerFormModern;
