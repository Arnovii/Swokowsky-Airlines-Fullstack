import { useEffect, useState } from "react";
import { ArrowLeft, Plane, Calendar, MapPin, Tag, ShoppingCart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AddToCartButton from "../../../common/AddToCartButton";
import { ClassSelectorModal } from "../../flightsearch/components/ClassSelectorModal";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../../api/axios";

export interface Noticia {
  titulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  url_imagen: string;
  modelo_aeronave: string;
  capacidad_aeronave: number;
  asientos_economica: number;
  asientos_primera_clase: number;
  precio_economica: number;
  precio_primera_clase: number;
  promocion: {
    nombre: string;
    descripcion: string;
    descuento: number;
    fecha_inicio: string;
    fecha_fin: string;
  } | null;
  estado: string;
  salida_programada_utc: string;
  llegada_programada_utc: string;
  hora_salida_local_ciudad_destino: string;
  hora_llegada_local_ciudad_destino: string;
  salida_colombia: string;
  llegada_colombia: string;
  origen: {
    ciudad: string;
    pais: string;
  };
  destino: {
    ciudad: string;
    pais: string;
  };
}

type FechaHora = { fecha: string; hora: string }

const ISO_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+\-]\d{2}:\d{2})?$/

function pad(n: number) { return String(n).padStart(2, '0') }

function formatIsoToReadable(
  iso?: string | null,
  opts?: { use24Hour?: boolean; spanishAmPm?: boolean }
): FechaHora {
  if (!iso) return { fecha: '-', hora: '-' }

  const m = iso.match(ISO_REGEX)
  if (!m) {
    const raw = (iso || '').replace(/(Z|[+\-]\d{2}:\d{2})\s*$/, '')
    const parts = raw.split('T')
    if (parts.length === 2) {
      const [datePart, timePartRaw] = parts
      const timePart = (timePartRaw.match(/^(\d{2}:\d{2})/) || [])[0] || '-'
      const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      const fecha = dateMatch ? `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}` : datePart
      return { fecha, hora: timePart }
    }
    return { fecha: iso, hora: '-' }
  }

  const [, year, month, day, hrStr, min] = m
  const hourNum = Number(hrStr)

  const fecha = `${day}/${month}/${year}`

  if (opts?.use24Hour) {
    return { fecha, hora: `${pad(hourNum)}:${min}` }
  }

  const ampm = hourNum >= 12 ? (opts?.spanishAmPm ? 'p. m.' : 'PM') : (opts?.spanishAmPm ? 'a. m.' : 'AM')
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12
  return { fecha, hora: `${pad(hour12)}:${min} ${ampm}` }
}

function formatearPesos(valor: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

export default function DetalleVuelo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // 👈 Obtén la función addToCart de tu context
  const { isAuthenticated } = useAuth(); // 👈 Verificar autenticación
  const [vuelo, setVuelo] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidadTickets, _setCantidadTickets] = useState(1); // 👈 Por si quieres permitir seleccionar cantidad

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get<Noticia>(`/news/${id}`);
        setVuelo(data);
      } catch (err: any) {
        console.error("❌ Error API DetalleVuelo:", err);
        setError("Error al obtener la información del vuelo. Revisa consola.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOpenModal = () => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      toast.info(
        '🔐 Debes iniciar sesión para agregar vuelos al carrito',
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
      navigate('/login', { state: { from: `/noticias/vuelo/${id}` } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleSelectClass = async (clase: 'economica' | 'primera_clase') => {
    if (!vuelo || !id) return;
    
    try {
      // 👇 Usa tu función addToCart del context
      await addToCart({
        id_vueloFK: parseInt(id), // Convierte el ID a número
        cantidad_de_tickets: cantidadTickets, // Por ahora 1, puedes hacerlo dinámico
        clase: clase,
      });

      // Si llegó aquí, se agregó exitosamente
      const precio = clase === 'economica' 
        ? vuelo.precio_economica 
        : vuelo.precio_primera_clase;
      
      const descuento = vuelo.promocion?.descuento ?? 0;
      const precioFinal = Math.round(precio * (1 - descuento));

      toast.success(
        <div>
          <strong className="block text-lg mb-1">¡Agregado al carrito! 🎉</strong>
          <div className="text-sm">
            <div className="font-semibold">{vuelo.origen.ciudad} → {vuelo.destino.ciudad}</div>
            <div className="text-gray-600">
              Clase: {clase === 'economica' ? 'Económica' : 'Primera Clase'}
            </div>
            <div className="text-gray-600">
              Tickets: {cantidadTickets}
            </div>
            <div className="font-bold text-green-600 mt-1">
              {formatearPesos(precioFinal * cantidadTickets)}
            </div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );

      navigate('/carrito');
      
    } catch (error) {
      // Los errores ya se manejan en addToCart con toasts
      // Solo loguea para debug
      console.error('Error al agregar al carrito desde detalle:', error);
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!vuelo) return <p className="text-center mt-10">Vuelo no encontrado</p>;

  const isColombia = (pais: string) => {
    if (!pais) return false;
    const s = String(pais).toLowerCase();
    return s === 'colombia' || s === 'co' || s.includes('col');
  };

  const origenPaisRaw = vuelo.origen.pais;
  const destinoPaisRaw = vuelo.destino.pais;
  const esNacional = isColombia(origenPaisRaw) && isColombia(destinoPaisRaw);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Botón volver */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/news")}
            className="group inline-flex items-center space-x-3 text-[#0e254d] hover:text-[#0a1a3a] transition-all duration-300 font-semibold bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/90 border border-white/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-all duration-300" />
            <span>Volver a noticias</span>
          </button>
        </div>

        {/* Imagen principal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white/20">
          <div className="relative h-96">
            <img
              src={vuelo.url_imagen}
              alt={vuelo.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

            <div className="absolute top-8 left-8">
              <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md text-white font-bold text-sm px-6 py-3 rounded-full shadow-2xl border border-white/20">
                <Plane className="w-4 h-4" />
                <span>{vuelo.estado}</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
                {vuelo.origen?.ciudad ?? "—"} → {vuelo.destino?.ciudad ?? "—"}
              </h1>
              <div className="flex items-center gap-3 text-white/90 mt-2">
                <MapPin size={16} />
                <span className="text-sm font-medium">
                  {vuelo.origen?.pais ?? "—"} → {vuelo.destino?.pais ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 lg:p-12 space-y-10">
            {/* Descripción */}
            <section>
              <h2 className="text-2xl font-bold text-[#081225] mb-2">
                {vuelo.titulo}
              </h2>
              <p className="text-gray-700 mb-4">{vuelo.descripcion_corta}</p>
              <p className="text-gray-600">{vuelo.descripcion_larga}</p>
            </section>

            {/* Datos del vuelo */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Horarios */}
              <Card
                title="Horarios"
                icon={<Calendar className="w-5 h-5 text-[#0e254d]" />}
              >
                {(() => {
                  const horarios: Array<{ label: string; value: string; pais?: string; tipo?: string }> = [];

                  if (!esNacional) {
                    horarios.push(
                      {
                        label: 'Hora Salida Local',
                        value: vuelo.hora_salida_local_ciudad_destino,
                        pais: vuelo.destino.pais,
                        tipo: 'local'
                      },
                      {
                        label: 'Hora Llegada Local',
                        value: vuelo.hora_llegada_local_ciudad_destino,
                        pais: vuelo.destino.pais,
                        tipo: 'local'
                      }
                    );
                  }

                  horarios.push(
                    { label: 'Hora Salida Colombia', value: vuelo.salida_colombia, tipo: 'colombia' },
                    { label: 'Hora Llegada Colombia', value: vuelo.llegada_colombia, tipo: 'colombia' }
                  );

                  return horarios.map(({ label, value, pais, tipo }) => {
                    const { fecha, hora } = formatIsoToReadable(value)
                    return (
                      <div key={label} className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          {label}
                          {label === 'Hora Salida Local' && pais ? ` (${pais})` : ''}
                          {label === 'Hora Llegada Local' && pais ? ` (${pais})` : ''}
                        </p>

                        {tipo === 'colombia' ? (
                          <>
                            <p className="text-gray-900">{fecha}</p>
                            <p className="text-gray-500">{hora}</p>
                          </>
                        ) : (
                          <p className="text-gray-900">{hora}</p>
                        )}
                      </div>
                    )
                  })
                })()}
              </Card>

              {/* Detalles del avión */}
              <Card
                title="Detalles del Avión"
                icon={<Plane className="w-5 h-5 text-[#0e254d]" />}
              >
                <Item label="Modelo" value={vuelo.modelo_aeronave} />
                <Item label="Capacidad total" value={vuelo.capacidad_aeronave} />
                <Item label="Asientos Económica" value={vuelo.asientos_economica} />
                <Item label="Asientos Primera Clase" value={vuelo.asientos_primera_clase} />
              </Card>

              <Card
                title="Tarifas"
                icon={<Tag className="w-5 h-5 text-[#0e254d]" />}
              >
                <PrecioConDescuento
                  label="Precio Económica"
                  price={vuelo.precio_economica}
                  promocion={vuelo.promocion}
                  formatearPesos={formatearPesos}
                />

                <PrecioConDescuento
                  label="Precio Primera Clase"
                  price={vuelo.precio_primera_clase}
                  promocion={vuelo.promocion}
                  formatearPesos={formatearPesos}
                />

                {vuelo.promocion ? (
                  <div className="mt-3 space-y-1">
                    <div className="text-sm font-semibold text-green-700">
                      {vuelo.promocion.nombre} — {vuelo.promocion.descuento * 100}% OFF
                    </div>
                    <div className="text-xs text-gray-600">
                      {vuelo.promocion.descripcion}
                    </div>
                    <div className="text-xs text-gray-500">
                      Válida hasta:{' '}
                      {new Date(vuelo.promocion.fecha_fin).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2">Sin promoción disponible</div>
                )}
              </Card>
            </section>

            {/* Botón de agregar al carrito */}
            <section className="flex justify-center mt-8">
              <AddToCartButton onClick={handleOpenModal}>
                <span className="flex items- gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito de compras
                </span>
              </AddToCartButton>
            </section>
          </div>
        </div>
      </div>

      {/* Modal de selección de clase */}
      <ClassSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectClass={handleSelectClass}
        flightInfo={{
          origen: vuelo.origen.ciudad,
          destino: vuelo.destino.ciudad,
          precio: vuelo.precio_economica,
        }}
      />
    </div>
  );
}

/* ---------- Componentes auxiliares ---------- */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg border border-slate-100/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#0e254d]/10 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-[#081225] text-lg">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold text-[#081225]">{value}</div>
    </div>
  );
}

function PrecioConDescuento({
  label,
  price,
  promocion,
  formatearPesos,
}: {
  label: string;
  price: number;
  promocion: any;
  formatearPesos: (v: number) => string;
}) {
  const descuento = promocion?.descuento ?? 0;
  const tienePromo = descuento > 0;
  const precioConDescuento = Math.round(price * (1 - descuento));
  const ahorro = price - precioConDescuento;

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {tienePromo ? (
          <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded">
            {Math.round(descuento * 100)}% OFF
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {tienePromo ? (
          <>
            <div className="text-sm text-gray-500 line-through" aria-hidden>
              {formatearPesos(price)}
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-xl font-semibold text-green-700">
                {formatearPesos(precioConDescuento)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="sr-only">Ahorro:</span>
                ahorras {formatearPesos(ahorro)}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {promocion?.nombre ? promocion.nombre : "Promoción vigente"}
            </div>
          </>
        ) : (
          <div className="text-lg font-semibold text-gray-900">
            {formatearPesos(price)}
          </div>
        )}
      </div>
    </div>
  );
}