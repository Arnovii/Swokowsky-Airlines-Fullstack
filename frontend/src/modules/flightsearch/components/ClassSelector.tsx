import React from 'react';

interface ClassSelectorProps {
  availableClasses: string[];
  selectedClass: string;
  onSelectClass: (classType: string) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ availableClasses, selectedClass, onSelectClass }) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Selecciona la clase:</label>
      <div className="flex gap-4">
        {availableClasses.map((clase) => (
          <button
            key={clase}
            type="button"
            className={`px-4 py-2 rounded-lg font-bold border ${selectedClass === clase ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
            onClick={() => onSelectClass(clase)}
          >
            {clase === 'economica' ? 'Económica' : 'Primera Clase'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassSelector;
