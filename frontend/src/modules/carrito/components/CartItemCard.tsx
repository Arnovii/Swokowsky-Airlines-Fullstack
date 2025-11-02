import React, { useState, useEffect } from "react";
import cartService from '../service/cartService';
import type { CartItem } from '../service/cartService';
import { useCountdown } from '../hooks/useCountdown';

type Props = {
    item: CartItem;
    onRemove: (id: number) => void;
    onQtyChange?: (itemId: number, qty: number) => void;
    onTimerReset?: () => void;
};

export function CartItemCard({ item, onRemove, onQtyChange, onTimerReset }: Props) {
    const [currentDeadline, setCurrentDeadline] = useState(item.fecha_limite);
    const { hours, minutes, seconds, expired } = useCountdown(currentDeadline);
    const [updating, setUpdating] = useState(false);
    const [localQty, setLocalQty] = useState(item.cantidad_de_tickets);

    useEffect(() => {
        setCurrentDeadline(item.fecha_limite);
    }, [item.fecha_limite]);

    const handleUpdate = async (newQty: number, isIncrement: boolean = false) => {
        if (newQty < 1 || newQty > 5 || newQty === localQty) return;

        setLocalQty(newQty);
        if (onQtyChange) onQtyChange(item.id_item_carrito, newQty); // <-- Cambiado aquí
        setUpdating(true);

        try {
            await cartService.updateItem(item.id_item_carrito, newQty);

            if (isIncrement && onTimerReset) {
                onTimerReset();
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            setLocalQty(item.cantidad_de_tickets);
            if (onQtyChange) onQtyChange(item.id_item_carrito, item.cantidad_de_tickets);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        setLocalQty(item.cantidad_de_tickets);
    }, [item.cantidad_de_tickets]);

    // Función para obtener la imagen del avión
    const getPlaneImage = (modelo: string | undefined) => {
        if (!modelo) return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop';
        
        const planeImages: { [key: string]: string } = {
            'Airbus A320': 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=400&fit=crop',
            'Boeing 787': 'https://images.unsplash.com/photo-1583792116623-18620e3177c9?w=400&h=400&fit=crop',
            'Boeing 737': 'https://images.unsplash.com/photo-1525624286412-4099c83c1bc8?w=400&h=400&fit=crop',
        };

        return planeImages[modelo] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop';
    };

    const precio = item.vuelo?.tarifas?.find((t: any) => t.clase === item.clase)?.precio_base || 0;

    // Obtener nombres de ciudades
    const ciudadOrigen = item.vuelo?.aeropuerto_origen?.ciudad || item.vuelo?.aeropuerto_origen?.codigo_iata || 'Origen';
    const ciudadDestino = item.vuelo?.aeropuerto_destino?.ciudad || item.vuelo?.aeropuerto_destino?.codigo_iata || 'Destino';

    return (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-[#39A5D8] hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Imagen del avión */}
                <div className="flex-shrink-0">
                    <div className="relative group">
                        <img
                            src={getPlaneImage(item.vuelo?.aeronave?.modelo)}
                            alt={item.vuelo?.aeronave?.modelo || 'Avión'}
                            className="w-full md:w-32 h-32 rounded-xl object-cover shadow-md border-2 border-gray-200 group-hover:border-[#39A5D8] transition-all duration-300"
                            onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#123361]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 flex flex-col justify-between gap-4">
                    {/* Header: Título y botón eliminar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#123361] tracking-tight mb-2">
                                {ciudadOrigen} → {ciudadDestino}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                <span className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-[#123361] to-[#1180B8] text-white rounded-lg font-semibold tracking-wide">
                                    {item.vuelo?.salida_programada_utc?.slice(0, 10)}
                                </span>
                                <span className="px-2.5 sm:px-3 py-1.5 bg-[#39A5D8] text-white rounded-lg font-semibold tracking-wide">
                                    CLASE {item.clase?.toUpperCase()}
                                </span>
                                <span className="px-2.5 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-xs">
                                    {item.vuelo?.aeropuerto_origen?.codigo_iata} → {item.vuelo?.aeropuerto_destino?.codigo_iata}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemove(item.id_item_carrito)}
                            className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">ELIMINAR</span>
                            <span className="sm:hidden">Eliminar</span>
                        </button>
                    </div>

                    {/* Sección de cantidad y precio */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t-2 border-gray-100">
                        {/* Selector de cantidad */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <span className="text-xs sm:text-sm font-bold text-gray-600 tracking-wide uppercase">Cantidad:</span>
                            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl p-2 shadow-inner">
                                <button
                                    disabled={localQty <= 1 || updating}
                                    onClick={() => handleUpdate(localQty - 1)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#123361] to-[#1180B8] text-white font-bold text-lg sm:text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                                >
                                    −
                                </button>
                                <span className="w-10 sm:w-12 text-center text-xl sm:text-2xl font-bold text-[#123361] tracking-wider">{localQty}</span>
                                <button
                                    disabled={localQty >= 5 || updating}
                                    onClick={() => handleUpdate(localQty + 1)}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#123361] to-[#1180B8] text-white font-bold text-lg sm:text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Precio */}
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <p className="text-xs font-bold text-gray-500 mb-1 tracking-widest uppercase">Precio Unitario</p>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] bg-clip-text text-transparent tracking-tight">
                                ${precio.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Contador de tiempo */}
                    <div className="mt-2">
                        {expired ? (
                            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg w-full sm:w-auto justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-bold text-xs sm:text-sm tracking-widest uppercase">Reserva Expirada</span>
                            </div>
                        ) : (
                            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#123361] via-[#1180B8] to-[#39A5D8] text-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-auto">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">Tiempo Restante:</span>
                                </div>
                                <span className="font-bold text-lg sm:text-xl tracking-wider tabular-nums ml-6 sm:ml-0">
                                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}