export const FLIGHT_CONSTANTS = {
  TIME_SLOTS: [
    { 
      value: 'manana', 
      label: 'Mañana', 
      sublabel: '05:00 - 11:59', 
      gradient: 'from-yellow-50 to-orange-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '🌅'
    },
    { 
      value: 'tarde', 
      label: 'Tarde', 
      sublabel: '12:00 - 17:59', 
      gradient: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: '☀️'
    },
    { 
      value: 'noche', 
      label: 'Noche', 
      sublabel: '18:00 - 04:59', 
      gradient: 'from-purple-50 to-indigo-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: '🌙'
    }
  ],

  FLIGHT_CLASSES: [
    { 
      value: 'economica', 
      label: 'Económica',
      description: 'Opción más accesible',
      icon: '💺',
      gradient: 'from-blue-50 to-cyan-50'
    },
    { 
      value: 'primera_clase', 
      label: 'Primera Clase',
      description: 'Máximo lujo y comodidad',
      icon: '✈️',
      gradient: 'from-purple-50 to-pink-50'
    }
  ],

  PRICE_RANGES: [
    { label: 'Económico', min: 0, max: 500000 },
    { label: 'Medio', min: 500000, max: 1000000 },
    { label: 'Premium', min: 1000000, max: 2000000 },
    { label: 'Lujo', min: 2000000, max: 0 }
  ],

  SORT_OPTIONS: [
    { value: 'precio', label: 'Menor precio' },
    { value: 'duracion', label: 'Menor duración' },
    { value: 'salida', label: 'Hora de salida' }
  ]
};

