import React, { useState } from "react";
import cartService from '../service/cartService';
import type { CartItem } from '../service/cartService';
import { useCountdown } from '../hooks/useCountdown';

type Props = {
    item: CartItem;
    onRemove: (id: number) => void;
    onLocalQtyChange?: (qty: number) => void;
};

export function CartItemCard({ item, onRemove, onLocalQtyChange }: Props) {
    const { hours, minutes, seconds, expired } = useCountdown(item.fecha_limite);
    const [updating, setUpdating] = useState(false);
    const [localQty, setLocalQty] = useState(item.cantidad_de_tickets);

    const handleUpdate = async (newQty: number) => {
        if (newQty < 1 || newQty > 5 || newQty === localQty) return;
        setLocalQty(newQty); // Optimistic update
        if (onLocalQtyChange) onLocalQtyChange(newQty);
        setUpdating(true);
        try {
            await cartService.updateItem(item.id_item_carrito, newQty);
            // El contexto refresca el carrito global, pero el usuario ve el cambio inmediato
        } catch {
            setLocalQty(item.cantidad_de_tickets); // Rollback if error
            if (onLocalQtyChange) onLocalQtyChange(item.cantidad_de_tickets);
        } finally {
            setUpdating(false);
        }
    };

    // Si el prop cambia por refresh global, sincroniza localQty
    React.useEffect(() => {
        setLocalQty(item.cantidad_de_tickets);
    }, [item.cantidad_de_tickets]);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4">
            <img
                src={item.vuelo?.aeronave?.modelo ? `/img/aviones/${item.vuelo.aeronave.modelo}.jpg` : '/img/avion-default.jpg'}
                alt={item.vuelo?.aeronave?.modelo || 'Avión'}
                className="w-24 h-24 rounded-lg object-cover border"
            />
            <div className="flex-1">
                <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-[#081225]">
                        Vuelo {item.vuelo?.aeropuerto_origen?.codigo_iata} → {item.vuelo?.aeropuerto_destino?.codigo_iata}
                    </h3>
                    <button
                        onClick={() => onRemove(item.id_item_carrito)}
                        className="text-sm text-red-600 hover:underline"
                    >
                        Eliminar
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    {item.vuelo?.salida_programada_utc?.slice(0, 10)} - Clase: {item.clase}
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={localQty <= 1 || updating}
                            onClick={() => handleUpdate(localQty - 1)}
                            className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                            -
                        </button>
                        <span className="w-10 text-center inline-block">{localQty}</span>
                        <button
                            disabled={localQty >= 5 || updating}
                            onClick={() => handleUpdate(localQty + 1)}
                            className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Precio</p>
                        <p className="text-base font-semibold text-[#081225]">
                            ${item.vuelo?.tarifas?.find((t: any) => t.clase === item.clase)?.precio_base?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>
                <div className="mt-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${expired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {expired
                            ? 'Reserva expirada'
                            : `Tiempo restante: ${hours.toString().padStart(2, '0')}:${minutes
                                  .toString()
                                  .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </span>
                </div>
            </div>
        </div>
    );
}