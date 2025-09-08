
import React, { useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

const HeroSection = () => {
  const [tripType, setTripType] = useState('round-trip');
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-brand-darkblue via-brand-darkcyan to-brand-cyan">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')"
        }}
      />
      
      {/* Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between p-6 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-brand-darkblue font-bold text-sm">S</span>
          </div>
          <span className="font-title font-bold text-xl">SuokomovskiAirlines</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="hover:text-brand-cyan transition-colors">Buscar vuelos</a>
          <a href="#" className="hover:text-brand-cyan transition-colors">Noticias</a>
          <a href="#" className="hover:text-brand-cyan transition-colors">Reserva y Check-in</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Users className="w-5 h-5" />
          <div className="w-5 h-5 border-2 border-white rounded" />
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center text-white mb-12">
          <h1 className="font-title text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Conoce la Belleza de Buenos Aires
          </h1>
          <p className="font-body text-2xl md:text-3xl font-light opacity-90">
            Vuelos desde 2 millones
          </p>
          <button className="mt-6 bg-brand-cyan hover:bg-brand-darkcyan text-white px-8 py-3 rounded-lg font-body font-medium transition-all duration-300 transform hover:scale-105">
            Reserva Ahora ✈️
          </button>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-body text-lg font-medium text-brand-darkblue">
              ¿Dónde te gustaría ir?
            </h3>
            
            {/* Trip Type Selector */}
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="trip-type" 
                  value="round-trip" 
                  checked={tripType === 'round-trip'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2 text-brand-cyan focus:ring-brand-cyan"
                />
                <span className="font-body text-sm text-gray-600">Ida y Vuelta</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="trip-type" 
                  value="one-way" 
                  checked={tripType === 'one-way'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2 text-brand-cyan focus:ring-brand-cyan"
                />
                <span className="font-body text-sm text-gray-600">Solo Ida</span>
              </label>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-stretch bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              {/* Origin */}
              <div className="flex-1 bg-white border-r border-gray-200">
                <div className="p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Origen</label>
                  <select className="w-full border-0 bg-transparent text-gray-900 focus:ring-0 font-body text-sm">
                    <option>Seleccionar</option>
                    <option>Buenos Aires (AEP)</option>
                    <option>Madrid (MAD)</option>
                    <option>Nueva York (JFK)</option>
                  </select>
                </div>
              </div>

              {/* Destination */}
              <div className="flex-1 bg-white border-r border-gray-200">
                <div className="p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Destino</label>
                  <select className="w-full border-0 bg-transparent text-gray-900 focus:ring-0 font-body text-sm">
                    <option>Seleccionar</option>
                    <option>Londres (LHR)</option>
                    <option>París (CDG)</option>
                    <option>Roma (FCO)</option>
                  </select>
                </div>
              </div>

              {/* Departure Date */}
              <div className="flex-1 bg-white border-r border-gray-200">
                <div className="p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Salida</label>
                  <input 
                    type="date" 
                    className="w-full border-0 bg-transparent text-gray-900 focus:ring-0 font-body text-sm"
                  />
                </div>
              </div>

              {/* Return Date (conditional) */}
              {tripType === 'round-trip' && (
                <div className="flex-1 bg-white border-r border-gray-200">
                  <div className="p-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Vuelta</label>
                    <input 
                      type="date" 
                      className="w-full border-0 bg-transparent text-gray-900 focus:ring-0 font-body text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Class */}
              <div className="flex-1 bg-white border-r border-gray-200">
                <div className="p-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Clase</label>
                  <select className="w-full border-0 bg-transparent text-gray-900 focus:ring-0 font-body text-sm">
                    <option>Económica</option>
                    <option>Premium</option>
                    <option>Business</option>
                    <option>Primera</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex-shrink-0">
                <button className="h-full px-8 bg-brand-cyan hover:bg-brand-darkcyan text-white font-body font-medium transition-all duration-300 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;