import { useState, useEffect } from 'react';
import axios from '../../../api/axios';

export interface Promotion {
  id: number;
  title: string;
  destination: string;
  discount: number; // porcentaje de descuento
  originalPrice: number;
  discountedPrice: number;
  image: string;
  description: string;
  validUntil: string;
  isActive: boolean;
}

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/news');
        const apiPromotions = Array.isArray(response.data)
          ? response.data.map((p) => {
              const promoObj = p as {
                id_promocion: number;
                titulo: string;
                destino: string;
                descuento: number;
                precio_original: number;
                precio_descuento: number;
                url_imagen: string;
                descripcion: string;
                fecha_vigencia: string;
                activa: boolean;
              };
              return {
                id: promoObj.id_promocion,
                title: promoObj.titulo,
                destination: promoObj.destino,
                discount: promoObj.descuento,
                originalPrice: promoObj.precio_original,
                discountedPrice: promoObj.precio_descuento,
                image: promoObj.url_imagen,
                description: promoObj.descripcion,
                validUntil: promoObj.fecha_vigencia,
                isActive: promoObj.activa
              };
            })
          : [];
        setPromotions(apiPromotions);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return { promotions, isLoading, error };
};