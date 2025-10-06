import React from 'react';

interface FlightInfoProps {
  flight: any; // Reemplazar por tipo real de vuelo
}

const FlightInfo: React.FC<FlightInfoProps> = ({ flight }) => {
  // Muestra información básica del vuelo
  return (
    <div className="mb-6 p-4 rounded-xl bg-blue-50">
      <div className="font-bold text-lg">{flight?.aircraftModel} | {flight?.origin?.codigo_iata} → {flight?.destination?.codigo_iata}</div>
      <div className="text-sm text-gray-600">Salida: {flight?.departureTimeUTC} | Llegada: {flight?.arrivalTimeUTC}</div>
      <div className="text-sm text-gray-600">Duración: {flight?.durationMinutes} min</div>
      {/* Puedes agregar más detalles aquí */}
    </div>
  );
};

export default FlightInfo;
