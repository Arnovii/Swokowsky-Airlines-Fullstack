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
            className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedClass === clase 
                ? 'bg-gradient-to-r from-[#0F6899] to-[#39A5D8] text-white border-[#39A5D8] shadow-lg' 
                : 'bg-white text-[#0F6899] border-[#39A5D8] hover:bg-gradient-to-r hover:from-[#39A5D8]/10 hover:to-[#0F6899]/10'
            }`}
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
