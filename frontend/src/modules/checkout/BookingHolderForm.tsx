import React from 'react';

const prefixOptions = [
  { value: '', label: 'Prefijo*' },
  { value: '+57', label: '+57 (Colombia)' },
  { value: '+51', label: '+51 (Perú)' },
  { value: '+54', label: '+54 (Argentina)' },
  // ...agrega más prefijos
];

const BookingHolderForm = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 font-sans">
      <h2 className="text-2xl font-bold mb-2 font-sans text-[#081225]">Titular de la reserva</h2>
      <p className="text-[#081225] mb-6 text-base font-sans">
        Será la persona que recibirá la confirmación y la única autorizada para solicitar cambios o reembolsos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <input type="text" className="border border-[#081225]/30 rounded-lg px-4 py-3 font-sans text-[#081225] focus:border-[#081225] focus:ring-2 focus:ring-[#081225]/30 transition" placeholder="Nombre del pasajero*" />
        <div className="flex gap-2">
          <select className="border border-[#081225]/30 rounded-lg px-4 py-3 font-sans text-[#081225] focus:border-[#081225] focus:ring-2 focus:ring-[#081225]/30 transition" defaultValue="">
            {prefixOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input type="text" className="border border-[#081225]/30 rounded-lg px-4 py-3 font-sans text-[#081225] w-full focus:border-[#081225] focus:ring-2 focus:ring-[#081225]/30 transition" placeholder="Número de teléfono*" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <input type="email" className="border border-[#081225]/30 rounded-lg px-4 py-3 font-sans text-[#081225] focus:border-[#081225] focus:ring-2 focus:ring-[#081225]/30 transition" placeholder="Correo electrónico*" />
        <input type="email" className="border border-[#081225]/30 rounded-lg px-4 py-3 font-sans text-[#081225] focus:border-[#081225] focus:ring-2 focus:ring-[#081225]/30 transition" placeholder="Confirmar correo electrónico*" />
      </div>
      <div className="flex items-center mt-2">
        <input type="checkbox" className="mr-2 accent-[#081225]" id="accept-promos" />
        <label htmlFor="accept-promos" className="text-sm text-[#081225] font-sans">
          Acepto el uso de mis datos personales para recibir promociones, ofertas y actualizaciones.
        </label>
      </div>
    </div>
  );
};

export default BookingHolderForm;
