import { useState, useEffect } from 'react';

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
        // TODO: Reemplazar con tu endpoint real
        // const response = await fetch('/api/promotions');
        // const data = await response.json();
        
        // Datos simulados mientras desarrollas

        const mockPromotions: Promotion[] = [
          {
            id: 1,
            title: "Super Descuento Bogotá-Madrid",
            destination: "Madrid, España",
            discount: 35,
            originalPrice: 2500000,
            discountedPrice: 1625000,
            image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
            description: "Vuela a la capital española con un increíble descuento",
            validUntil: "2024-12-31",
            isActive: true
          },
          {
            id: 2,
            title: "Oferta Miami Beach",
            destination: "Miami, Estados Unidos",
            discount: 25,
            originalPrice: 1800000,
            discountedPrice: 1350000,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            description: "Disfruta las playas de Miami a precio especial",
            validUntil: "2024-11-30",
            isActive: true
          },
          {
            id: 3,
            title: "Buenos Aires Tango",
            destination: "Buenos Aires, Argentina",
            discount: 40,
            originalPrice: 2200000,
            discountedPrice: 1320000,
            image: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=800&q=80",
            description: "Experimenta la cultura porteña con descuento especial",
            validUntil: "2024-10-31",
            isActive: true
          },
          {
            id: 4,
            title: "Medellín",
            destination: "Medellín, Colombia",
            discount: 40,
            originalPrice: 2200000,
            discountedPrice: 1320000,
            image: "https://images.unsplash.com/photo-1604014237337-5ab07fcb35c8?auto=format&fit=crop&w=800&q=80",
            description: "Vive la ciudad de la eterna primavera con un precio especial",
            validUntil: "2024-10-31",
            isActive: true
          }
        ];


        // Simular delay de red
        setTimeout(() => {
          setPromotions(mockPromotions);
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return { promotions, isLoading, error };
};