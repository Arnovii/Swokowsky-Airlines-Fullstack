import React from 'react';

export type PassengerFormData = {
  name: string;
  lastName: string;
  dni: string;
  age: number;
};

interface PassengerFormProps {
  index: number;
  data: PassengerFormData;
  onChange: (data: PassengerFormData) => void;
  errors?: string[];
}

const PassengerForm: React.FC<PassengerFormProps> = ({ index, data, onChange, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: name === 'age' ? Number(value) : value });
  };

  return (
    <div className="mb-6 p-4 rounded-xl border border-gray-200">
      <div className="font-bold mb-2">Pasajero {index + 1}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={data.name}
          onChange={handleChange}
          placeholder="Nombre"
          className="px-3 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="lastName"
          value={data.lastName}
          onChange={handleChange}
          placeholder="Apellido"
          className="px-3 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="dni"
          value={data.dni}
          onChange={handleChange}
          placeholder="DNI"
          className="px-3 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          name="age"
          value={data.age}
          onChange={handleChange}
          placeholder="Edad"
          className="px-3 py-2 border rounded-lg"
          min={0}
          required
        />
      </div>
      {errors && errors.length > 0 && (
        <div className="mt-2 text-red-600 text-sm">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}
    </div>
  );
};

export default PassengerForm;
