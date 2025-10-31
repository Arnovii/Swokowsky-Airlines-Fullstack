import React, { useEffect, useState } from "react";

interface Ticket {
  id_ticket: number;
  id_usuarioFK: number;
  id_vueloFK: number;
  asiento_numero: string;
  asiento_clase: string;
  precio: number;
  estado: string;
  creado_en: string;
}

export default function TicketListView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Simulación de fetch
    setTimeout(() => {
      setTickets([
        {
          id_ticket: 1,
          id_usuarioFK: 3,
          id_vueloFK: 22,
          asiento_numero: "12A",
          asiento_clase: "Ejecutiva",
          precio: 550.75,
          estado: "Confirmado",
          creado_en: "2025-10-30T12:45:00",
        },
        {
          id_ticket: 2,
          id_usuarioFK: 5,
          id_vueloFK: 18,
          asiento_numero: "7C",
          asiento_clase: "Económica",
          precio: 320.5,
          estado: "Pendiente",
          creado_en: "2025-10-28T09:20:00",
        },
        {
          id_ticket: 3,
          id_usuarioFK: 2,
          id_vueloFK: 33,
          asiento_numero: "3B",
          asiento_clase: "Primera Clase",
          precio: 980.99,
          estado: "Cancelado",
          creado_en: "2025-10-25T17:10:00",
        },
      ]);
    }, 600);
  }, []);

  if (tickets.length === 0)
    return <div className="text-center py-10">Cargando tickets...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-5xl border border-gray-100">
        <h1 className="text-3xl font-bold text-[#081225] mb-6 text-center">
          🎫 Lista de Tickets
        </h1>

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id_ticket}
              className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#081225]">
                    Ticket #{ticket.id_ticket}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Vuelo ID: {ticket.id_vueloFK}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600 w-full md:w-auto">
                  <Info label="Clase" value={ticket.asiento_clase} />
                  <Info label="Asiento" value={ticket.asiento_numero} />
                  <Info label="Precio" value={`$${ticket.precio.toFixed(2)}`} />
                  <Info label="Estado" value={ticket.estado} />
                  <Info
                    label="Creado en"
                    value={new Date(ticket.creado_en).toLocaleString()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
      <p className="text-xs uppercase text-[#3B82F6] font-semibold tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-[#081225] font-medium">{value}</p>
    </div>
  );
}
