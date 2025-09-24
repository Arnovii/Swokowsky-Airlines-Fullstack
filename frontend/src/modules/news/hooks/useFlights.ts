import { useState, useEffect } from 'react';

export interface Flight {
  id: number;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  aircraft: string;
  image: string;
  isInternational: boolean;
  promotion?: {
    discount: number;
    originalPrice: number;
  };

}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setIsLoading(true);

        // Mock de vuelos con imágenes verificadas y funcionales
        const mockFlights: Flight[] = [
          {
            id: 1,
            origin: "Bogotá",
            destination: "Madrid",
            originCode: "BOG",
            destinationCode: "MAD",
            departureTime: "14:30",
            arrivalTime: "06:15+1",
            duration: "9h 45m",
            price: 2500000,
            aircraft: "Boeing 787",
            // URL corregida para Madrid
            image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
            isInternational: true,
            promotion: {
              discount: 15,
              originalPrice: 2941176
            }
            
          },
          {
            id: 2,
            origin: "Bogotá",
            destination: "Medellín",
            originCode: "BOG",
            destinationCode: "MDE",
            departureTime: "08:00",
            arrivalTime: "09:15",
            duration: "1h 15m",
            price: 280000,
            aircraft: "Airbus A320",
            // URL corregida para Medellín
            image: "https://images.unsplash.com/photo-1620249272894-399ac83c1871?auto=format&fit=crop&w=800&q=80",
            isInternational: false
          },
          {
            id: 3,
            origin: "Medellín",
            destination: "Miami",
            originCode: "MDE",
            destinationCode: "MIA",
            departureTime: "22:45",
            arrivalTime: "05:30+1",
            duration: "5h 45m",
            price: 1800000,
            aircraft: "Boeing 737-800",
            // URL corregida para Miami
            image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80",
            isInternational: true,
            promotion: {
              discount: 20,
              originalPrice: 2250000
            }
          },
          {
            id: 4,
            origin: "Bogotá",
            availableSeats: 12,
            originCode: "BOG",
            destinationCode: "CTG",
            departureTime: "16:20",
            arrivalTime: "18:05",
            duration: "1h 45m",
            price: 320000,
            aircraft: "Boeing 737-700",
            // URL corregida para Cartagena
            image: "https://images.unsplash.com/photo-1583482745039-659cb597667d?auto=format&fit=crop&w=800&q=80",
            isInternational: false
          },
          {
            id: 5,
            origin: "Bogotá",
            destination: "San Andrés",
            originCode: "BOG",
            destinationCode: "ADZ",
            departureTime: "09:45",
            arrivalTime: "12:30",
            duration: "2h 45m",
            price: 450000,
            aircraft: "ATR 42",
            // URL corregida para San Andrés
            image: "https://images.unsplash.com/photo-1589322191771-591b223c7c25?auto=format&fit=crop&w=800&q=80",
            isInternational: false
          }
        ];

        setTimeout(() => {
          setFlights(mockFlights);
          setIsLoading(false);
        }, 1200);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, []);

  return { flights, isLoading, error };
};