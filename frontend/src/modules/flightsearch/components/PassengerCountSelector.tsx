import React from 'react';

interface PassengerCountSelectorProps {
  count: number;
  setCount: (n: number) => void;
  max?: number;
}

const PassengerCountSelector: React.FC<PassengerCountSelectorProps> = ({ count, setCount, max = 5 }) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Número de pasajeros (máx. {max}):</label>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="px-3 py-1 rounded-lg bg-gray-200 font-bold"
          disabled={count <= 1}
          onClick={() => setCount(count - 1)}
        >
          -
        </button>
        <span className="px-4 font-bold text-lg">{count}</span>
        <button
          type="button"
          className="px-3 py-1 rounded-lg bg-gray-200 font-bold"
          disabled={count >= max}
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PassengerCountSelector;
