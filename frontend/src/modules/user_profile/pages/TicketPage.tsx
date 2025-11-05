import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

interface Pasajero {
  id_pasajero: number;
  id_ticketFK: number;
  nombre: string;
  apellido: string;
  dni: string;
  phone: string;
  email: string;
  contact_name?: string;
  phone_name?: string;
  genero: string;
  fecha_nacimiento: string;
}

interface Ticket {
  id_ticket: number;
  id_usuarioFK: number;
  id_vueloFK: number;
  asiento_numero: string;
  asiento_clase: string;
  precio: number;
  estado: string;
  creado_en: string;
  pasajero?: Pasajero | null; // ✅ agregado
}

export default function TicketListView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets");

        let data = res.data;
        if (!Array.isArray(data) && data?.data) {
          data = data.data;
        }

        setTickets(data ?? []);
      } catch (err: any) {
        console.error("Error al cargar tickets:", err);
        setError("No se pudieron cargar los tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div className="text-center py-10">Cargando tickets...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Fondo con degradado animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#123664] via-[#12699E] to-[#1785BC] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1785BC] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#123664] rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER MODERNO */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#12699E] via-[#1785BC] to-[#123664] shadow-2xl shadow-[#1785BC]/30 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-[#123664] via-[#12699E] to-[#1785BC] bg-clip-text text-transparent mb-4">
              Mis Tickets de Vuelo
            </h1>
            <p className="text-gray-600 text-lg">Todos tus boletos en un solo lugar</p>
          </div>

          {/* TICKETS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id_ticket}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#1785BC]/30 transform hover:-translate-y-1"
              >
                {/* HEADER CON DEGRADADO */}
                <div className="relative bg-gradient-to-r from-[#123664] via-[#12699E] to-[#1785BC] px-8 py-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-between text-white">
                    <div className="flex items-center space-x-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Ticket</p>
                        <h2 className="text-4xl font-black">#{ticket.id_ticket}</h2>
                      </div>
                    </div>
                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                      <p className="text-sm opacity-80 uppercase tracking-wider mb-1">Emitido</p>
                      <p className="text-xl font-bold">
                        {new Date(ticket.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTENIDO */}
                <div className="p-8">
                  {/* INFO DEL VUELO */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
                    <Info label="Vuelo" value={`#${ticket.id_vueloFK}`} icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    <Info label="Clase" value={ticket.asiento_clase} icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    <Info label="Asiento" value={ticket.asiento_numero} icon="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6a1 1 0 011-1h1a1 1 0 011 1z" />
                    <Info label="Precio" value={`${ticket.precio.toFixed(2)}`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <div className="col-span-2 md:col-span-1 flex items-end">
                      <div className={`inline-flex items-center px-5 py-3 rounded-2xl text-sm font-bold shadow-lg transform transition-all duration-300 ${
                        ticket.estado === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-emerald-500/50' :
                        ticket.estado === 'pendiente' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-500/50' :
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-gray-500/50'
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 animate-pulse ${
                          ticket.estado === 'confirmado' ? 'bg-white' :
                          ticket.estado === 'pendiente' ? 'bg-white' :
                          'bg-white'
                        }`}></span>
                        {ticket.estado.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* PASAJERO */}
                  {ticket.pasajero && (
                    <div className="relative bg-gradient-to-br from-[#12699E]/5 via-[#1785BC]/5 to-[#123664]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#1785BC]/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1785BC]/10 to-transparent rounded-full filter blur-2xl"></div>
                      
                      <div className="relative flex items-center mb-8">
                        <div className="bg-gradient-to-br from-[#12699E] via-[#1785BC] to-[#123664] rounded-2xl p-4 mr-5 shadow-lg shadow-[#1785BC]/30">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-black bg-gradient-to-r from-[#123664] to-[#1785BC] bg-clip-text text-transparent">
                          Información del Pasajero
                        </h3>
                      </div>

                      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Info
                          label="Nombre completo"
                          value={`${ticket.pasajero.nombre} ${ticket.pasajero.apellido}`}
                          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                        <Info label="DNI" value={ticket.pasajero.dni} icon="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        <Info label="Teléfono" value={ticket.pasajero.phone} icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        <Info label="Email" value={ticket.pasajero.email} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        <Info label="Género" value={ticket.pasajero.genero} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        <Info
                          label="Fecha de nacimiento"
                          value={new Date(ticket.pasajero.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />

                        {ticket.pasajero.contact_name && (
                          <Info label="Contacto de emergencia" value={ticket.pasajero.contact_name} icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        )}
                        {ticket.pasajero.phone_name && (
                          <Info label="Teléfono de emergencia" value={ticket.pasajero.phone_name} icon="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
      <p className="text-[10px] uppercase text-blue-500 font-semibold tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-[#081225] font-medium break-words">{value}</p>
    </div>
  );
}
