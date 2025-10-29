
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../../../context/CartContext';
import type { CartItem } from '../service/cartService';
import { CartItemCard } from '../components/CartItemCard';


import React, { useState } from "react";

const Carrito: React.FC = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCart } = useCart();

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

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="mx-auto w-full max-w-5xl">
                <h1 className="text-3xl md:text-4xl font-bold text-[#081225] mb-6">
                    Tu carrito
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Izquierda: ítems */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                                <p className="text-gray-500">Tu carrito está vacío.</p>
                                <div className="mt-4 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => navigate("/")}
                                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white"
                                    >
                                        Explorar vuelos
                                    </button>
                                    <button
                                        onClick={() => navigate("/perfil?tab=wallet")}
                                        className="px-5 py-2 rounded-lg border text-[#0F6899] border-[#0F6899]"
                                    >
                                        Recargar monedero
                                    </button>
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
                                    />
                                ))}


                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handleClear}
                                        className="text-sm text-gray-600 hover:underline"
                                    >
                                        Vaciar carrito
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Derecha: resumen + monedero + acciones */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                            <h3 className="text-lg font-semibold text-[#081225]">Resumen</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                {/* Si manejas fees/impuestos, muéstralos aquí */}
                                {tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Impuestos</span>
                                        <span className="font-medium">+{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                <div className="border-t pt-2 flex justify-between">
                                    <span className="text-[#081225] font-semibold">Total</span>
                                    <span className="text-[#081225] font-bold">
                                        {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-[#0F6899] to-[#3B82F6] text-white font-medium hover:shadow-lg hover:shadow-[#3B82F6]/20 transition"
                                >
                                    Pasar al checkout
                                </button>
                            </div>
                            <div className="mt-4 p-3 rounded-xl border bg-blue-50 text-blue-900 text-sm">
                                Para proceder con la compra de su ticket, ve al checkout, diligencia la información y realiza el pago.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;
