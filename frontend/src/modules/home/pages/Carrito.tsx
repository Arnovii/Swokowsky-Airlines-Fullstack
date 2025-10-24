import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* =========================
    MOCKS (reemplaza luego)
   ========================= */

type CartItem = {
    id: string;
    title: string;
    description?: string;
  price: number; // USD
    qty: number;
    image?: string;
};

const MOCK_ITEMS: CartItem[] = [
    {
    id: "it_1",
    title: "Vuelo Pereira → Bogotá",
    description: "15/12/2025 - 07:30 AM • Equipaje 10kg",
    price: 120,
    qty: 1,
    image:
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=400&auto=format&fit=crop",
    },
    {
    id: "it_2",
    title: "Asiento XL - Pasillo",
    description: "Fila 7C • Más espacio para piernas",
    price: 25,
    qty: 1,
    image:
        "https://images.unsplash.com/photo-1481196430182-c1e352a3ea81?q=80&w=400&auto=format&fit=crop",
    },
    {
    id: "it_3",
    title: "Maleta adicional 20kg",
    description: "Facturada • 20 kg",
    price: 30,
    qty: 1,
    image:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop",
    },
];

// Saldo de monedero (mock). Luego tráelo de /wallet/me
const MOCK_WALLET_BALANCE = 80;

/* =========================
    COMPONENTE
   ========================= */

export default function CartPage() {
    const navigate = useNavigate();

  // Carrito
    const [items, setItems] = useState<CartItem[]>(MOCK_ITEMS);

  // Monedero (solo pago con monedero)
    const [walletBalance, setWalletBalance] = useState<number>(MOCK_WALLET_BALANCE);

  // Totales
    const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0),
    [items]
    );

  // Si quieres impuestos/fees, agrega aquí; por ahora 0:
    const tax = 0;
    const total = useMemo(() => Math.max(0, subtotal + tax), [subtotal]);

    const canPay = walletBalance >= total && items.length > 0;

  // Acciones carrito
    const inc = (id: string) =>
    setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );

    const dec = (id: string) =>
    setItems((prev) =>
        prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
        )
    );

    const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

    const clear = () => setItems([]);

  // Pagar con monedero (solo UI)
    const handlePay = () => {
    if (!canPay) {
        const faltante = (total - walletBalance).toFixed(2);
        const msg = [
        `Saldo insuficiente en el monedero.`,
        `Total: $${total.toFixed(2)} — Saldo: $${walletBalance.toFixed(2)} — Faltan $${faltante}.`,
        ``,
        `Ve a recargar tu monedero en Perfil → Monedero.`,
        ].join("\n");
        alert(msg);
        return;
    }

    // Simulación: descontar del saldo y vaciar carrito
    setWalletBalance((b) => Number((b - total).toFixed(2)));
    setItems([]);
    alert(`Pago realizado con monedero por $${total.toFixed(2)} ✅`);

    // TODO: aquí llamarías a tu endpoint real:
    // await api.post('/wallet/consume', { amount: total, items });
    // y luego redirigirías a confirmación
    // navigate('/confirmacion');
    };

    const handleCancel = () => {
    // Decide adónde volver. Por ahora, a Home:
    navigate("/");
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
            {items.length === 0 ? (
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
                {items.map((it) => (
                    <div
                    key={it.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4"
                    >
                    <img
                        src={it.image}
                        alt={it.title}
                        className="w-24 h-24 rounded-lg object-cover border"
                    />
                    <div className="flex-1">
                        <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-[#081225]">
                            {it.title}
                        </h3>
                        <button
                            onClick={() => remove(it.id)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Eliminar
                        </button>
                        </div>
                        {it.description && (
                        <p className="text-sm text-gray-500 mt-1">
                            {it.description}
                        </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                            onClick={() => dec(it.id)}
                            className="w-8 h-8 rounded-lg border flex items-center justify-center"
                            > 
                            −
                            </button>
                            <span className="w-10 text-center">{it.qty}</span>
                            <button
                            onClick={() => inc(it.id)}
                            className="w-8 h-8 rounded-lg border flex items-center justify-center"
                            >
                            +
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Precio</p>
                            <p className="text-base font-semibold text-[#081225]">
                            ${it.price.toFixed(2)}
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}

                <div className="flex items-center justify-between">
                    <button
                    onClick={clear}
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
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {/* Si manejas fees/impuestos, muéstralos aquí */}
                {tax > 0 && (
                    <div className="flex justify-between">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="font-medium">+${tax.toFixed(2)}</span>
                    </div>
                )}

                <div className="border-t pt-2 flex justify-between">
                    <span className="text-[#081225] font-semibold">Total</span>
                    <span className="text-[#081225] font-bold">
                    ${total.toFixed(2)}
                    </span>
                </div>
                </div>

              {/* Monedero */}
                <div className="mt-2 p-3 rounded-xl border bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm text-gray-600">Saldo de monedero</p>
                    <p className="text-lg font-semibold text-[#081225]">
                        ${walletBalance.toFixed(2)} USD
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => navigate("/perfil?tab=wallet")}
                    className="text-xs text-[#0F6899] underline"
                    >
                    Recargar
                    </button>
                </div>
                {walletBalance < total && (
                    <p className="text-xs text-red-600 mt-1">
                    Saldo insuficiente. Te faltan $
                    {(total - walletBalance).toFixed(2)}.
                    </p>
                )}
                </div>

              {/* Acciones */}
                <div className="space-y-2">
                <button
                    disabled={!canPay}
                    onClick={handlePay}
                    className={`w-full px-5 py-3 rounded-lg text-white font-medium transition
                    ${
                    canPay
                        ? "bg-gradient-to-r from-[#0F6899] to-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/20"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                    Pagar con monedero
                </button>

                <button
                    onClick={handleCancel}
                    className="w-full px-5 py-3 rounded-lg border text-[#0F6899] border-[#0F6899] hover:bg-gray-50"
                >
                    Cancelar
                </button>

                {walletBalance < total && (
                    <button
                    onClick={() => navigate("/perfil?tab=wallet")}
                    className="w-full px-5 py-3 rounded-lg bg-white border border-[#0F6899] text-[#0F6899] hover:bg-[#0F6899] hover:text-white transition"
                    >
                    Ir a recargar monedero
                    </button>
                )}
                </div>

                <p className="text-[11px] text-gray-500">
                * UI de demostración. En producción, este flujo consumirá tu
                monedero y confirmará la compra.
                </p>
            </div>
            </div>
        </div>
        </div>
    </div>
    );
}
