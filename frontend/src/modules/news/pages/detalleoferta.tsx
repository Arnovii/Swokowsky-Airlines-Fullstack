import { useState } from "react";
import { Calendar, MapPin, Plane, ArrowLeft, Tag } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { usePromotions } from "../hooks/usePromotions";

export default function DetalleOferta() {
  // ✅ todos los hooks primero
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { promotions, isLoading, error } = usePromotions();
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ handlers pueden ir después de los hooks
  const handleVolver = () => navigate("/news");

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  const oferta = promotions.find((p) => p.id === Number(id));
  if (!oferta) return <p>Oferta no encontrada</p>;

  const handleReservar = () => navigate(`/oferta/${oferta.id}`);

   


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header con botón de volver */}
                <div className="mb-6">
                    <button
                        onClick={handleVolver}
                        className="inline-flex items-center space-x-2 text-[#0e254d] hover:text-[#0a1a3a] transition-colors font-medium group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Volver a ofertas</span>
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="relative h-80 overflow-hidden">
                        <img
                            src={oferta.image}
                            alt={oferta.title}
                            className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'transform hover:scale-105' : 'opacity-0'
                                }`}
                            onLoad={() => setImageLoaded(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Badges flotantes */}
                        <div className="absolute top-6 left-6 flex flex-col space-y-2">
                            <span className="inline-flex items-center space-x-1 bg-white/95 backdrop-blur-sm text-[#0e254d] font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                                <Tag className="w-4 h-4" />
                                <span>OFERTA ESPECIAL</span>
                            </span>
                        </div>

                        <div className="absolute top-6 right-6">
                            <div className="bg-red-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg animate-pulse">
                                -{oferta.discount}%
                            </div>
                        </div>

                        {/* Título superpuesto */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                {oferta.title}
                            </h1>
                            <div className="flex items-center space-x-4 text-white/90">
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Destino: {oferta.destination}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Columna izquierda - Detalles */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-[#0e254d]/5 to-[#0a1a3a]/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-[#0e254d] mb-4 flex items-center space-x-2">
                                        <Plane className="w-5 h-5" />
                                        <span>Detalles de la Oferta</span>
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-[#0e254d] mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Destino</p>
                                                <p className="text-gray-600">{oferta.destination}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <Tag className="w-5 h-5 text-[#0e254d] mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Descuento</p>
                                                <p className="text-gray-600">{oferta.discount}% OFF</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                                    <p className="text-gray-700 leading-relaxed">{oferta.description}</p>
                                </div>
                            </div>

                            {/* Columna derecha - Precios y CTA */}
                            <div className="space-y-6">
                                {/* Card de precios */}
                                <div className="bg-gradient-to-br from-[#0e254d] to-[#0a1a3a] rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold mb-4 text-center">Precio Especial</h3>

                                        <div className="text-center space-y-2">
                                            <div className="text-white/70 line-through text-xl">
                                                ${oferta.originalPrice.toLocaleString()}
                                            </div>
                                            <div className="text-4xl font-bold text-green-400">
                                                ${oferta.discountedPrice.toLocaleString()}
                                            </div>
                                            <p className="text-white/90 text-sm">
                                                Ahorras ${(oferta.originalPrice - oferta.discountedPrice).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fecha límite */}
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                                    <div className="flex items-center space-x-3 text-orange-800">
                                        <Calendar className="w-5 h-5" />
                                        <div>
                                            <p className="font-semibold">Válido hasta:</p>
                                            <p className="text-lg font-bold">{oferta.validUntil}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de reservar */}
                                <button
                                    onClick={handleReservar}
                                    className="w-full bg-gradient-to-r from-[#0e254d] to-[#0a1a3a] hover:from-[#0a1a3a] hover:to-[#0e254d] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                >
                                    Reservar Ahora
                                </button>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        🎫 Oferta válida mientras tengamos disponibilidad
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
