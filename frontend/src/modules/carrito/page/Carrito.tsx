import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../../context/CartContext';
import type { CartItem } from '../service/cartService';
import { CartItemCard } from '../components/CartItemCard';
import React, { useState } from "react";

const Carrito: React.FC = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCart, refreshCart, updateSingleItem } = useCart();

    // Estado local para cantidades de tickets por item
    const [quantities, setQuantities] = useState<{ [id: number]: number }>({});

    // Sincroniza cantidades locales con el carrito global
    React.useEffect(() => {
        const q: { [id: number]: number } = {};
        cart.forEach(it => { q[it.id_item_carrito] = it.cantidad_de_tickets; });
        setQuantities(q);
    }, [cart]);

    // Totales en tiempo real
    const subtotal = useMemo(
        () => cart.reduce(
            (acc: number, it: CartItem) => acc + ((it.vuelo?.tarifas?.find((t: any) => t.clase === it.clase)?.precio_base || 0) * (quantities[it.id_item_carrito] ?? it.cantidad_de_tickets)),
            0
        ),
        [cart, quantities]
    );
    const tax = 0;
    const total = useMemo(() => Math.max(0, subtotal + tax), [subtotal]);

    // Acciones carrito reales
    const handleRemove = (id: number) => removeFromCart(id);
    const handleClear = () => clearCart();

    // ⭐ MODIFICADO: Handler para cuando se actualiza cantidad (reinicio de timer)
    const handleTimerReset = (itemId: number) => {
        console.log(`🔄 Actualizando timer para item ${itemId}...`);
        if (updateSingleItem) {
            updateSingleItem(itemId); // Solo actualizar el item específico
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-white py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
            <div className="mx-auto w-full max-w-7xl">
                {/* Header con botón volver */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                    {/* Botón volver */}
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#123361] to-[#1180B8] text-white hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-sm sm:text-base"
                    >
                        <svg 
                            className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">REGRESAR</span>
                    </button>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#123361] tracking-tight mb-2 sm:mb-3">
                        TU CARRITO
                    </h1>
                    <div className="h-1 sm:h-1.5 w-24 sm:w-32 bg-gradient-to-r from-[#123361] via-[#39A5D8] to-[#1180B8] rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* Izquierda: ítems */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-5">
                        {cart.length === 0 ? (
                            <div className="bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
                                <div className="text-center">
                                    <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 md:mb-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 sm:border-4 border-white/30">
                                        <svg className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-wide">
                                        TU CARRITO ESTÁ VACÍO
                                    </h2>
                                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-md mx-auto px-4">
                                        Explora nuestros destinos y comienza tu próxima aventura
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl bg-white text-[#123361] hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
                                        >
                                            EXPLORAR VUELOS
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {cart.map((it: CartItem) => (
                                    <CartItemCard
                                        key={it.id_item_carrito}
                                        item={it}
                                        onRemove={handleRemove}
                                        onLocalQtyChange={qty => setQuantities(q => ({ ...q, [it.id_item_carrito]: qty }))}
                                        onTimerReset={handleTimerReset} // ⭐ Pasar callback mejorado
                                    />
                                ))}

                                <div className="flex items-center justify-end px-1 sm:px-2 pt-3 sm:pt-4">
                                    <button
                                        onClick={handleClear}
                                        className="group flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden sm:inline">VACIAR CARRITO</span>
                                        <span className="sm:hidden">VACIAR</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Derecha: resumen */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-[#123361] via-[#1180B8] to-[#39A5D8] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl lg:sticky lg:top-6">
                            <div className="mb-5 sm:mb-6 md:mb-8">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide mb-2">
                                    RESUMEN DE COMPRA
                                </h3>
                                <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-white/40 rounded-full"></div>
                            </div>

                            <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-5 sm:mb-6 md:mb-8">
                                <div className="flex justify-between items-baseline py-2 sm:py-3 border-b border-white/20">
                                    <span className="text-sm sm:text-base md:text-lg text-white/80 font-medium">SUBTOTAL</span>
                                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {tax > 0 && (
                                    <div className="flex justify-between items-baseline py-2 sm:py-3 border-b border-white/20">
                                        <span className="text-sm sm:text-base md:text-lg text-white/80 font-medium">IMPUESTOS</span>
                                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                            +${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-baseline pt-3 sm:pt-4 md:pt-5">
                                    <span className="text-lg sm:text-xl md:text-2xl text-white font-bold">TOTAL</span>
                                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Botón principal */}
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="w-full px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-lg sm:text-xl md:text-2xl font-bold rounded-xl sm:rounded-2xl bg-white text-[#123361] hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl mb-4 sm:mb-5 md:mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                PROCEDER AL PAGO
                            </button>

                            {/* Info box */}
                            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 sm:border-2">
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                                        Completa la información requerida en el checkout y realiza el pago de manera segura para confirmar tu reserva.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;