import { useState, useEffect } from 'react';
import axios from '../../../api/axios';

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
        const response = await axios.get('/flights');
        // Normaliza los datos si es necesario
        const apiFlights = Array.isArray(response.data)
          ? response.data.map((f) => {
              const flightObj = f as Record<string, any>;
              return {
                id: flightObj.id_vuelo,
                origin: flightObj.origen?.ciudad || '',
                destination: flightObj.destino?.ciudad || '',
                originCode: flightObj.origen?.codigo_iata || '',
                destinationCode: flightObj.destino?.codigo_iata || '',
                departureTime: flightObj.salida_programada_utc,
                arrivalTime: flightObj.llegada_programada_utc,
                duration: flightObj.duracion || '',
                price: flightObj.precio_economica || 0,
                aircraft: flightObj.modelo_aeronave || '',
                image: flightObj.url_imagen || '',
                isInternational: flightObj.isInternational || false,
                promotion: flightObj.promocion ? {
                  discount: flightObj.promocion.descuento || 0,
                  originalPrice: flightObj.promocion.precio_original || 0
                } : undefined
              };
            })
          : [];
        setFlights(apiFlights);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido');
        }
        setIsLoading(false);
      }
    };
    fetchFlights();
  }, []);

  return { flights, isLoading, error };
};