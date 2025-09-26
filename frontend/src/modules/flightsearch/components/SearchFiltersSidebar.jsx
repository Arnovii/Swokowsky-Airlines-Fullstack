import React, { useState } from 'react';
import { Filter, Clock, Star, X, ChevronDown, DollarSign, Sparkles } from 'lucide-react';
import { FLIGHT_CONSTANTS } from '../constants/flightConstants';
import { FlightUtils } from '../utils/flightUtils';

const FilterSection = ({ id, title, icon, iconBg, iconColor, children, badge = null, isExpanded, onToggle }) => {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${iconBg} rounded-xl group-hover:scale-105 transition-transform duration-200`}>
            {React.cloneElement(icon, { size: 20, className: iconColor })}
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[#081225] text-lg font-sans">{title}</h4>
            {badge && <div className="text-xs text-gray-500 font-sans">{badge}</div>}
          </div>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SearchFiltersSidebar = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState({
    precio: true,
    horario: true,
    clase: true,
    promociones: true
  });

  const handlePriceChange = (type, value) => {
    onFiltersChange({
      ...filters,
      precio: { ...filters.precio, [type]: parseInt(value) || 0 }
    });
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      precio: { min: 0, max: 0 },
      horaSalida: [],
      clase: [],
      soloPromociones: false
    });
  };

  const activeFiltersCount = FlightUtils.getActiveFiltersCount(filters);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-auto
        w-80 lg:w-full bg-white/90 lg:bg-white backdrop-blur-xl lg:backdrop-blur-none
        border border-white/20 lg:border-gray-200 rounded-2xl lg:rounded-xl
        transform transition-all duration-500 ease-out z-50 lg:z-auto
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 shadow-lg lg:shadow-sm'}
        overflow-y-auto
      `}>
        <div className="p-6">
          {/* Header móvil */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Filter size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#081225] font-sans">Filtros</h3>
                <p className="text-sm text-gray-500 font-sans">Personaliza tu búsqueda</p>
              </div>
            </div>
            <button 
              onClick={onToggle}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Contador de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 font-sans">
                  {activeFiltersCount} filtros activos
                </span>
              </div>
            </div>
          )}

          {/* Precio */}
          <FilterSection
            id="precio"
            title="Rango de precio"
            icon={<DollarSign />}
            iconBg="bg-gradient-to-br from-emerald-100 to-green-100"
            iconColor="text-emerald-600"
            badge={filters.precio.min > 0 || filters.precio.max > 0 ? 
              `${filters.precio.min > 0 ? FlightUtils.formatPrice(filters.precio.min) : 'Min'} - ${filters.precio.max > 0 ? FlightUtils.formatPrice(filters.precio.max) : 'Max'}` : 
              "Cualquier precio"
            }
            isExpanded={expandedSections.precio}
            onToggle={() => toggleSection('precio')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">Desde</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-sans bg-gray-50 hover:bg-white"
                      placeholder="150,000"
                      value={filters.precio.min || ''}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400 text-sm">$</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-sans">Hasta</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-sans bg-gray-50 hover:bg-white"
                      placeholder="2,000,000"
                      value={filters.precio.max || ''}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400 text-sm">$</span>
                  </div>
                </div>
              </div>
              
              {/* Rangos rápidos */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {FLIGHT_CONSTANTS.PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => onFiltersChange({
                      ...filters,
                      precio: { min: range.min, max: range.max }
                    })}
                    className="p-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-sans"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Horario */}
          <FilterSection
            id="horario"
            title="Horario de salida"
            icon={<Clock />}
            iconBg="bg-gradient-to-br from-orange-100 to-amber-100"
            iconColor="text-orange-600"
            badge={filters.horaSalida.length > 0 ? `${filters.horaSalida.length} seleccionados` : "Cualquier hora"}
            isExpanded={expandedSections.horario}
            onToggle={() => toggleSection('horario')}
          >
            <div className="space-y-3">
              {FLIGHT_CONSTANTS.TIME_SLOTS.map((option) => {
                const isSelected = filters.horaSalida.includes(option.value);
                return (
                  <label key={option.value} className="block cursor-pointer">
                    <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? `bg-gradient-to-r ${option.gradient} ${option.border} shadow-md ${option.text}` 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newHoras = e.target.checked
                              ? [...filters.horaSalida, option.value]
                              : filters.horaSalida.filter(h => h !== option.value);
                            handleFilterChange('horaSalida', newHoras);
                          }}
                          className="w-5 h-5 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 font-sans">{option.label}</div>
                          <div className="text-sm text-gray-600 font-sans">{option.sublabel}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Clase */}
          <FilterSection
            id="clase"
            title="Clase de vuelo"
            icon={<Star />}
            iconBg="bg-gradient-to-br from-purple-100 to-pink-100"
            iconColor="text-purple-600"
            badge={filters.clase.length > 0 ? filters.clase.join(", ").replace("_", " ") : "Cualquier clase"}
            isExpanded={expandedSections.clase}
            onToggle={() => toggleSection('clase')}
          >
            <div className="space-y-3">
              {FLIGHT_CONSTANTS.FLIGHT_CLASSES.map((option) => {
                const isSelected = filters.clase.includes(option.value);
                return (
                  <label key={option.value} className="block cursor-pointer">
                    <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? `bg-gradient-to-r ${option.gradient} border-blue-200 shadow-md text-blue-800`
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newClases = e.target.checked
                              ? [...filters.clase, option.value]
                              : filters.clase.filter(c => c !== option.value);
                            handleFilterChange('clase', newClases);
                          }}
                          className="w-5 h-5 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 font-sans">{option.label}</div>
                          <div className="text-sm text-gray-600 font-sans">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Promociones */}
          <FilterSection
            id="promociones"
            title="Ofertas especiales"
            icon={<Sparkles />}
            iconBg="bg-gradient-to-br from-green-100 to-emerald-100"
            iconColor="text-green-600"
            badge={filters.soloPromociones ? "Solo ofertas" : "Incluye todas"}
            isExpanded={expandedSections.promociones}
            onToggle={() => toggleSection('promociones')}
          >
            <label className="block cursor-pointer">
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                filters.soloPromociones
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.soloPromociones}
                    onChange={(e) => handleFilterChange('soloPromociones', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded-md focus:ring-2 focus:ring-green-500 transition-all"
                  />
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <div className="font-bold text-[#081225] font-sans">Solo promociones</div>
                    <div className="text-sm text-gray-600 font-sans">Ver únicamente ofertas especiales</div>
                  </div>
                </div>
              </div>
            </label>
          </FilterSection>

          {/* Botones de acción */}
          <div className="space-y-3 pt-4">
            <button
              onClick={clearAllFilters}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold font-sans hover:scale-105"
            >
              🔄 Limpiar filtros
            </button>
            
            <button
              onClick={onToggle}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#081225] to-[#1a2332] text-white rounded-xl hover:from-[#1a2332] hover:to-[#081225] transition-all duration-200 font-bold font-sans shadow-lg hover:shadow-xl hover:scale-105 lg:hidden"
            >
              ✈️ Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </>
  );
};