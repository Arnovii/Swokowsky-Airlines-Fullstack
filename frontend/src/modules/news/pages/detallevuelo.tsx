import { useState } from "react";
import { Calendar, MapPin, Plane, ArrowLeft, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useFlights } from "../hooks/useFlights";

export default function DetalleVuelo() {
    // ✅ todos los hooks primero
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { flights, isLoading, error } = useFlights();
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleVolver = () => navigate("/news");
    
    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    const vuelo = flights.find((f) => f.id === Number(id));
    if (!vuelo) return <p>Vuelo no encontrado</p>;

    const handleReservar = () => navigate(`/vuelo/${vuelo.id}`);
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 py-8 px-4 font-sans">
        <div className="max-w-5xl mx-auto">
            {/* Header con botón de volver mejorado */}
            <div className="mb-8">
                <button
                    onClick={handleVolver}          
                    className="group inline-flex items-center space-x-3 text-[#0e254d] hover:text-[#0a1a3a] transition-all duration-300 font-semibold bg-white/70 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/90 border border-white/50"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-all duration-300" />
                    <span>Volver a noticias</span>
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white/20">
                {/* Hero Section Mejorado */}
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={vuelo.image}
                        alt={`${vuelo.origin} a ${vuelo.destination}`}
                        className={`w-full h-full object-cover transition-all duration-1000 ${imageLoaded ? 'transform hover:scale-110' : 'opacity-0 scale-105'}`}
                        onLoad={() => setImageLoaded(true)}
                    />
                    
                    {/* Overlay con gradiente más sofisticado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent"></div>
                    
                    {/* Badge flotante con glassmorphism */}
                    <div className="absolute top-8 left-8">
                        <div className="flex items-center space-x-2 bg-white/15 backdrop-blur-md text-white font-bold text-sm px-6 py-3 rounded-full shadow-2xl border border-white/20">
                            <Plane className="w-4 h-4" />
                            <span>VUELO DESTACADO</span>
                        </div>
                    </div>

                    {/* Precio destacado en la esquina */}
                    <div className="absolute top-8 right-8">
                        <div className="bg-[#0e254d]/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-[#0e254d]/30">
                            <div className="text-xs font-medium opacity-90">Desde</div>
                            <div className="text-2xl font-bold">${vuelo.price.toLocaleString()}</div>
                            {vuelo.promotion && (
                                <div className="text-xs line-through opacity-70">${vuelo.promotion.originalPrice.toLocaleString()}</div>
                            )}
                        </div>
                    </div>

                    {/* Título superpuesto */}
                    <div className="absolute bottom-8 left-8 right-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
                            {vuelo.origin} → {vuelo.destination}
                        </h1>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <MapPin size={16} />
                                <span className="text-sm font-medium">{vuelo.originCode} → {vuelo.destinationCode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal con mejor organización */}
                <div className="p-8 lg:p-12">
                    
                    {/* Información de vuelo en cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                        
                        {/* Card de Horarios */}
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg border border-slate-100/50 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#0e254d]/10 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-[#0e254d]" />
                                </div>
                                <h3 className="font-bold text-[#081225] text-lg">Horarios</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Salida</div>
                                    <div className="text-lg font-semibold text-[#081225]">{vuelo.departureTime}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Llegada</div>
                                    <div className="text-lg font-semibold text-[#081225]">{vuelo.arrivalTime}</div>
                                </div>
                            </div>
                        </div>

                        {/* Card de Detalles del Vuelo */}
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg border border-slate-100/50 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#0e254d]/10 rounded-xl flex items-center justify-center">
                                    <Plane className="w-5 h-5 text-[#0e254d]" />
                                </div>
                                <h3 className="font-bold text-[#081225] text-lg">Detalles</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</div>
                                    <div className="text-lg font-semibold text-[#081225]">{vuelo.duration}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aeronave</div>
                                    <div className="text-lg font-semibold text-[#081225]">{vuelo.aircraft}</div>
                                </div>
                            </div>
                        </div>

                        {/* Card de Información Adicional */}
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg border border-slate-100/50 hover:shadow-xl transition-all duration-300 md:col-span-2 xl:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#0e254d]/10 rounded-xl flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-[#0e254d]" />
                                </div>
                                <h3 className="font-bold text-[#081225] text-lg">Información</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Vuelo</div>
                                    <div className="text-lg font-semibold text-[#081225]">
                                        {vuelo.isInternational ? 'Internacional' : 'Nacional'}
                                    </div>
                                </div>
                                {vuelo.promotion && (
                                    <div>
                                        <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Promoción Activa</div>
                                        <div className="text-lg font-semibold text-green-700">
                                            {vuelo.promotion.discount}% descuento
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Promoción destacada si existe */}
                    {vuelo.promotion && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Tag className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-green-800 mb-1">¡Promoción Especial!</h3>
                                    <p className="text-green-700">
                                        Ahorra {vuelo.promotion.discount}% • 
                                        <span className="line-through ml-2">${vuelo.promotion.originalPrice.toLocaleString()}</span>
                                        <span className="font-bold ml-2">${vuelo.price.toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA mejorado */}
                    <div className="text-center">
                        <button
                            onClick={handleReservar}
                            className="group relative bg-gradient-to-r from-[#0e254d] to-[#1a3461] text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-[#0e254d]/25 transition-all duration-300 hover:scale-105 hover:from-[#0a1a3a] hover:to-[#142948] border-2 border-[#0e254d]/20 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <Plane className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                Reservar Vuelo Ahora
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                        
                        <p className="text-gray-500 text-sm mt-4 font-medium">
                            Reserva segura • Cancelación gratuita • Mejor precio garantizado
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
