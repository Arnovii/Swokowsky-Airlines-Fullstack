import { useEffect, useState } from "react";
import { ArrowLeft, Plane, Calendar, MapPin, Tag } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
  salida_local_origen: string;
  llegada_local_destino: string;
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

function formatDateTime(dateString: string) {
  if (!dateString) return { fecha: '-', hora: '-' }
  const date = new Date(dateString)
  return {
    // fecha completa para Colombia
    fecha: format(date, 'dd/MM/yyyy', { locale: es }),
    // hora con AM/PM en español
    hora: format(date, 'hh:mm a', { locale: es })
  }
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
  const [vuelo, setVuelo] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Usa SIEMPRE la URL completa de la API para evitar problemas de proxy
        const { data } = await axios.get<Noticia>(
          `http://localhost:3000/api/v1/news/${id}`
        );
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

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!vuelo) return <p className="text-center mt-10">Vuelo no encontrado</p>;

  // Helper para detectar Colombia (case-insensitive y tolerant)
  const isColombia = (pais?: string | null) => {
    if (!pais) return false;
    const s = String(pais).toLowerCase();
    return s === 'colombia' || s === 'co' || s.includes('col');
  };

  // Determinamos si el vuelo es nacional (origen y destino en Colombia)
  const origenPaisRaw = vuelo.origen?.pais ?? '';
  const destinoPaisRaw = vuelo.destino?.pais ?? '';
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
              <Card
                title="Horarios"
                icon={<Calendar className="w-5 h-5 text-[#0e254d]" />}
              >
                {(() => {
                  // Construimos horarios dinámicamente: solo mostramos "local" si NO es nacional
                  const horarios: Array<{ label: string; value: string; pais?: string; tipo?: string }> = [];

                  if (!esNacional) {
                    horarios.push(
                      {
                        label: 'Salida Local Origen',
                        value: vuelo.salida_local_origen,
                        pais: vuelo.destino?.pais,
                        tipo: 'local'
                      },
                      {
                        label: 'Llegada Local Destino',
                        value: vuelo.llegada_local_destino,
                        pais: vuelo.destino?.pais,
                        tipo: 'local'
                      }
                    );
                  }

                  horarios.push(
                    { label: 'Salida Colombia', value: vuelo.salida_programada_utc, tipo: 'colombia' },
                    { label: 'Llegada Colombia', value: vuelo.llegada_programada_utc, tipo: 'colombia' }
                  );

                  return horarios.map(({ label, value, pais, tipo }) => {
                    const { fecha, hora } = formatDateTime(value)
                    return (
                      <div key={label} className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          {label}
                          {label === 'Llegada Local Destino' && pais ? ` (${pais})` : ''}
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
          </div>
        </div>
      </div>
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

/**
 * Props:
 * - label: string
 * - price: number (precio original en COP)
 * - promocion: { descuento: number }  // descuento = 0.2 para 20%
 * - formatearPesos: funcion para formatear números a COP
 */
function PrecioConDescuento({
  label,
  price,
  promocion,
  formatearPesos,
  compact = false,
}: {
  label: string;
  price: number;
  promocion: any;
  formatearPesos: (v: number) => string;
  compact?: boolean;
}) {
  const descuento = promocion?.descuento ?? 0;
  const tienePromo = descuento > 0;
  const precioConDescuento = Math.round(price * (1 - descuento));
  const ahorro = price - precioConDescuento;

  return (
    <div className={`w-full ${compact ? "py-2" : "py-3"}`}>
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
