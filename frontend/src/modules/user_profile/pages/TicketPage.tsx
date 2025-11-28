// frontend/src/modules/user_profile/pages/TicketPage.tsx

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

// ====== Tipos según tu modelo Prisma + vuelo devuelto por /api/v1/tickets ======

interface Pasajero {
  id_pasajero: number;
  id_ticketFK: number;
  nombre: string;
  apellido: string;
  dni: string;
  phone: string;
  email: string;
  contact_name?: string | null;
  phone_name?: string | null;
  genero: string;
  fecha_nacimiento: string;
}

interface VueloInfo {
  id_vuelo: number;
  id_aeronaveFK: number;
  id_aeropuerto_origenFK: number;
  id_aeropuerto_destinoFK: number;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  id_promocionFK: number | null;
  estado: string;
}

type TicketEstado = "pagado" | "cancelado" | "pendiente" | string;

interface Ticket {
  id_ticket: number;
  id_usuarioFK: number;
  id_vueloFK: number;
  asiento_numero: string;
  asiento_clase: string; // enum asiento_clases en el backend
  precio: number;
  estado: TicketEstado; // enum ticket_estado en Prisma
  creado_en: string;
  pasajero?: Pasajero | null;
  vuelo?: VueloInfo | null; // 👈 viene del GET /api/v1/tickets
}

type FilterStatus = "todos" | "pagados" | "cancelados";

// ====== Componente principal ======

export default function TicketListView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos");

  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Carga de tickets desde GET /api/v1/tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
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

  // ====== Helpers de cancelación ======

  const canCancelTicket = (ticket: Ticket): boolean => {
    const estado = (ticket.estado || "").toLowerCase().trim();

    // No se puede cancelar si ya está cancelado
    if (estado === "cancelado") return false;

    // Solo tickets pagados / confirmados
    if (estado !== "pagado" && estado !== "confirmado") return false;

    const salidaStr = ticket.vuelo?.salida_programada_utc;
    if (!salidaStr) return false;

    const now = Date.now();
    const salidaMs = new Date(salidaStr).getTime();
    const diffHours = (salidaMs - now) / (1000 * 60 * 60);

    return diffHours > 1;
  };

  const getCancelBlockReason = (ticket: Ticket): string | null => {
    const estado = (ticket.estado || "").toLowerCase().trim();

    if (estado === "cancelado") {
      return "Este ticket ya está cancelado.";
    }

    if (!ticket.vuelo?.salida_programada_utc) {
      return "No se encontró la hora de salida del vuelo.";
    }

    const now = Date.now();
    const salidaMs = new Date(ticket.vuelo.salida_programada_utc).getTime();

    // 🛑 Si el vuelo ya despegó
    if (salidaMs < now) {
      return "No se puede reembolsar el ticket porque el vuelo ya despegó.";
    }

    const diffHours = (salidaMs - now) / (1000 * 60 * 60);

    if (diffHours <= 1) {
      return "No puedes cancelar este ticket porque falta menos de 1 hora para la salida del vuelo.";
    }

    return null;
  };


  const handleCancelTicket = async (ticket: Ticket) => {
    setGlobalMessage(null);
    setGlobalError(null);

    const blockReason = getCancelBlockReason(ticket);
    if (blockReason) {
      setGlobalError(blockReason);
      return;
    }

    try {
      setCancelLoadingId(ticket.id_ticket);

      // 👇 Ajusta esta línea si tu backend usa otra ruta/forma
      await api.patch(`/tickets/${ticket.id_ticket}`, { estado: "cancelado" });

      // Actualizar estado local
      setTickets((prev) =>
        prev.map((t) =>
          t.id_ticket === ticket.id_ticket ? { ...t, estado: "cancelado" } : t
        )
      );

      setGlobalMessage("✅ Ticket cancelado correctamente.");
    } catch (err: any) {
      console.error("Error al cancelar ticket:", err?.response?.data || err);
      setGlobalError(
        err?.response?.data?.message ||
          "No se pudo cancelar el ticket. Intenta nuevamente."
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (loading) return <div className="text-center py-10">Cargando tickets...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  // ====== Aplicar filtro por estado (pagados / cancelados) ======
  const filteredTickets = tickets.filter((ticket) => {
    const estado = (ticket.estado || "").toLowerCase().trim();

    if (filterStatus === "todos") return true;

    if (filterStatus === "pagados") {
      return estado === "pagado" || estado === "confirmado";
    }

    if (filterStatus === "cancelados") {
      return estado === "cancelado";
    }

    return true;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Fondo con degradado animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#123664] via-[#12699E] to-[#1785BC] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1785BC] rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-[#123664] rounded-full filter blur-3xl opacity-10 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER + volver */}
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex justify-start">
              <button
                onClick={() => navigate("/perfil")}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all"
              >
                <span className="mr-2">←</span>
                Volver a mi perfil
              </button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#12699E] via-[#1785BC] to-[#123664] shadow-2xl shadow-[#1785BC]/30 transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-[#123664] via-[#12699E] to-[#1785BC] bg-clip-text text-transparent mb-2">
                Mis Tickets de Vuelo
              </h1>
              <p className="text-gray-600 text-lg">
                Todos tus boletos en un solo lugar
              </p>
            </div>
          </div>

          {/* Mensajes globales */}
          {globalMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
              {globalMessage}
            </div>
          )}
          {globalError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {globalError}
            </div>
          )}

          {/* FILTRO: Todos / Pagados / Cancelados */}
          <div className="flex justify-center mb-10">
            <div className="flex space-x-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
              <button
                onClick={() => setFilterStatus("todos")}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "todos"
                    ? "bg-[#1785BC] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => setFilterStatus("pagados")}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "pagados"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pagados
              </button>

              <button
                onClick={() => setFilterStatus("cancelados")}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "cancelados"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancelados
              </button>
            </div>
          </div>

          {/* LISTA DE TICKETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {filteredTickets.map((ticket) => {
              const canCancel = canCancelTicket(ticket);
              const blockReason = getCancelBlockReason(ticket);

              return (
                <TicketCard
                  key={ticket.id_ticket}
                  ticket={ticket}
                  canCancel={canCancel}
                  blockReason={blockReason}
                  isCancelling={cancelLoadingId === ticket.id_ticket}
                  onCancel={() => handleCancelTicket(ticket)}
                />
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="text-center text-gray-500 py-16 text-lg">
                No hay tickets con ese estado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Card para cada ticket ======

interface TicketCardProps {
  ticket: Ticket;
  canCancel: boolean;
  blockReason: string | null;
  isCancelling: boolean;
  onCancel: () => void;
}

function TicketCard({
  ticket,
  canCancel,
  blockReason,
  isCancelling,
  onCancel,
}: TicketCardProps) {
  const estado = (ticket.estado || "").toLowerCase().trim();

  const { badgeClasses, label } = (() => {
    if (estado === "pagado" || estado === "confirmado") {
      return {
        badgeClasses:
          "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-emerald-500/50",
        label: "PAGADO",
      };
    }
    if (estado === "cancelado") {
      return {
        badgeClasses:
          "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-500/50",
        label: "CANCELADO",
      };
    }
    return {
      badgeClasses:
        "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-500/50",
      label: (ticket.estado || "DESCONOCIDO").toUpperCase(),
    };
  })();

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#1785BC]/30 transform hover:-translate-y-1">
      {/* HEADER CON DEGRADADO */}
      <div className="relative bg-gradient-to-r from-[#123664] via-[#12699E] to-[#1785BC] px-8 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

        <div className="relative flex items-center justify-between text-white">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">
                Ticket
              </p>
              <h2 className="text-4xl font-black">#{ticket.id_ticket}</h2>
            </div>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
            <p className="text-sm opacity-80 uppercase tracking-wider mb-1">
              Emitido
            </p>
            <p className="text-xl font-bold">
              {new Date(ticket.creado_en).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-8">
        {/* INFO DEL VUELO */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-6">
          <Info label="Vuelo" value={`#${ticket.id_vueloFK}`} />
          <Info label="Clase" value={ticket.asiento_clase} />
          <Info label="Asiento" value={ticket.asiento_numero} />
          <Info
            label="Precio"
            value={ticket.precio.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            })}
          />
          <div className="col-span-2 md:col-span-1 flex items-end justify-between md:justify-end gap-2">
            <div
              className={`inline-flex items-center px-5 py-3 rounded-2xl text-sm font-bold shadow-lg transform transition-all duration-300 ${badgeClasses}`}
            >
              <span className="w-2.5 h-2.5 rounded-full mr-2 animate-pulse bg-white"></span>
              {label}
            </div>
          </div>
        </div>

        {/* Info de fecha de salida (si viene el vuelo) */}
        {ticket.vuelo?.salida_programada_utc && (
          <div className="mb-4">
            <Info
              label="Salida programada"
              value={new Date(
                ticket.vuelo.salida_programada_utc
              ).toLocaleString("es-CO")}
            />
          </div>
        )}

        {/* Botón cancelar / mensaje bloqueo */}
        <div className="mb-6">
          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all ${
                isCancelling ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isCancelling ? "Cancelando..." : "Reembolsar ticket"}
            </button>
          ) : (
            blockReason && (
              <p className="text-sm text-red-600 font-semibold italic">
                {blockReason}
              </p>
            )
          )}
        </div>


        {/* PASAJERO */}
        {ticket.pasajero && (
          <div className="relative bg-gradient-to-br from-[#12699E]/5 via-[#1785BC]/5 to-[#123664]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#1785BC]/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1785BC]/10 to-transparent rounded-full filter blur-2xl"></div>

            <div className="relative flex items-center mb-8">
              <div className="bg-gradient-to-br from-[#12699E] via-[#1785BC] to-[#123664] rounded-2xl p-4 mr-5 shadow-lg shadow-[#1785BC]/30">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
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
              />
              <Info label="DNI" value={ticket.pasajero.dni} />
              <Info label="Teléfono" value={ticket.pasajero.phone} />
              <Info label="Email" value={ticket.pasajero.email} />
              <Info label="Género" value={ticket.pasajero.genero} />
              <Info
                label="Fecha de nacimiento"
                value={new Date(
                  ticket.pasajero.fecha_nacimiento
                ).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              {ticket.pasajero.contact_name && (
                <Info
                  label="Contacto de emergencia"
                  value={ticket.pasajero.contact_name}
                />
              )}
              {ticket.pasajero.phone_name && (
                <Info
                  label="Teléfono de emergencia"
                  value={ticket.pasajero.phone_name}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper de campo info
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
