
// ================== DURACIONES DE VUELO (en minutos) ==================
// Tabla de duraciones estimadas entre ciudades
// VUELOS NACIONALES: Todas las capitales principales de Colombia
// VUELOS INTERNACIONALES: Solo desde Bogotá, Medellín, Cali, Pereira, Cartagena hacia Madrid, Londres, New York, Buenos Aires, Miami
const DURACIONES_VUELO: Record<string, Record<string, number>> = {
  // ==================== VUELOS NACIONALES ====================
  "Bogotá": {
    // Principales
    "Medellín": 55, "Cali": 60, "Barranquilla": 90, "Cartagena": 80, "Bucaramanga": 55,
    "Pereira": 40, "Manizales": 45, "Santa Marta": 95, "Cúcuta": 70, "Ibagué": 35,
    "Villavicencio": 35, "Armenia": 40, "Montería": 75, "Neiva": 45, "Pasto": 75,
    "Sincelejo (Corozal)": 80, "Riohacha": 100, "Valledupar": 85, "Popayán": 65,
    "Tunja (Paipa)": 30, "Florencia": 70, "Yopal": 50, "Mocoa (Villagarzón)": 80,
    "San Andrés": 120, "Mitú": 110, "Puerto Carreño": 95, "Inírida": 100, "Quibdó": 55, "Leticia": 120,
    // Internacionales (origen permitido)
    "Madrid": 600, "Londres": 660, "New York": 330, "Buenos Aires": 450, "Miami": 240
  },
  "Medellín": {
    "Bogotá": 55, "Cali": 50, "Barranquilla": 70, "Cartagena": 60, "Bucaramanga": 50,
    "Pereira": 30, "Manizales": 35, "Santa Marta": 75, "Cúcuta": 65, "Ibagué": 40,
    "Villavicencio": 60, "Armenia": 35, "Montería": 50, "Neiva": 55, "Pasto": 70,
    "Sincelejo (Corozal)": 55, "Riohacha": 80, "Valledupar": 70, "Popayán": 60,
    "Tunja (Paipa)": 55, "Florencia": 75, "Yopal": 70, "Mocoa (Villagarzón)": 85,
    "San Andrés": 100, "Mitú": 120, "Puerto Carreño": 110, "Inírida": 115, "Quibdó": 35, "Leticia": 130,
    // Internacionales (origen permitido)
    "Madrid": 590, "Londres": 650, "New York": 320, "Buenos Aires": 440, "Miami": 230
  },
  "Cali": {
    "Bogotá": 60, "Medellín": 50, "Barranquilla": 100, "Cartagena": 90, "Bucaramanga": 70,
    "Pereira": 30, "Manizales": 40, "Santa Marta": 105, "Cúcuta": 85, "Ibagué": 45,
    "Villavicencio": 70, "Armenia": 25, "Montería": 80, "Neiva": 50, "Pasto": 40,
    "Sincelejo (Corozal)": 85, "Riohacha": 110, "Valledupar": 100, "Popayán": 35,
    "Tunja (Paipa)": 65, "Florencia": 65, "Yopal": 80, "Mocoa (Villagarzón)": 55,
    "San Andrés": 115, "Mitú": 100, "Puerto Carreño": 120, "Inírida": 110, "Quibdó": 55, "Leticia": 110,
    // Internacionales (origen permitido)
    "Madrid": 620, "Londres": 680, "New York": 350, "Buenos Aires": 420, "Miami": 260
  },
  "Barranquilla": {
    "Bogotá": 90, "Medellín": 70, "Cali": 100, "Cartagena": 25, "Bucaramanga": 60,
    "Pereira": 80, "Manizales": 85, "Santa Marta": 25, "Cúcuta": 70, "Ibagué": 95,
    "Villavicencio": 100, "Armenia": 90, "Montería": 40, "Neiva": 100, "Pasto": 115,
    "Sincelejo (Corozal)": 35, "Riohacha": 45, "Valledupar": 40, "Popayán": 105,
    "Tunja (Paipa)": 95, "Florencia": 110, "Yopal": 95, "Mocoa (Villagarzón)": 120,
    "San Andrés": 80, "Mitú": 140, "Puerto Carreño": 120, "Inírida": 130, "Quibdó": 70, "Leticia": 150
  },
  "Cartagena": {
    "Bogotá": 80, "Medellín": 60, "Cali": 90, "Barranquilla": 25, "Bucaramanga": 65,
    "Pereira": 75, "Manizales": 80, "Santa Marta": 35, "Cúcuta": 80, "Ibagué": 85,
    "Villavicencio": 95, "Armenia": 85, "Montería": 35, "Neiva": 90, "Pasto": 105,
    "Sincelejo (Corozal)": 30, "Riohacha": 55, "Valledupar": 50, "Popayán": 95,
    "Tunja (Paipa)": 85, "Florencia": 100, "Yopal": 90, "Mocoa (Villagarzón)": 110,
    "San Andrés": 75, "Mitú": 135, "Puerto Carreño": 115, "Inírida": 125, "Quibdó": 65, "Leticia": 145,
    // Internacionales (origen permitido)
    "Madrid": 555, "Londres": 615, "New York": 290, "Buenos Aires": 430, "Miami": 195
  },
  "Bucaramanga": {
    "Bogotá": 55, "Medellín": 50, "Cali": 70, "Barranquilla": 60, "Cartagena": 65,
    "Pereira": 55, "Manizales": 60, "Santa Marta": 65, "Cúcuta": 40, "Ibagué": 60,
    "Villavicencio": 65, "Armenia": 60, "Montería": 70, "Neiva": 65, "Pasto": 85,
    "Sincelejo (Corozal)": 65, "Riohacha": 70, "Valledupar": 55, "Popayán": 75,
    "Tunja (Paipa)": 45, "Florencia": 80, "Yopal": 55, "Mocoa (Villagarzón)": 95,
    "San Andrés": 110, "Mitú": 120, "Puerto Carreño": 85, "Inírida": 100, "Quibdó": 65, "Leticia": 130
  },
  "Pereira": {
    "Bogotá": 40, "Medellín": 30, "Cali": 30, "Barranquilla": 80, "Cartagena": 75,
    "Bucaramanga": 55, "Manizales": 15, "Santa Marta": 85, "Cúcuta": 70, "Ibagué": 30,
    "Villavicencio": 55, "Armenia": 15, "Montería": 65, "Neiva": 50, "Pasto": 55,
    "Sincelejo (Corozal)": 70, "Riohacha": 95, "Valledupar": 85, "Popayán": 45,
    "Tunja (Paipa)": 50, "Florencia": 65, "Yopal": 65, "Mocoa (Villagarzón)": 70,
    "San Andrés": 105, "Mitú": 110, "Puerto Carreño": 100, "Inírida": 105, "Quibdó": 40, "Leticia": 120,
    // Internacionales (origen permitido)
    "Madrid": 610, "Londres": 670, "New York": 340, "Buenos Aires": 430, "Miami": 165
  },
  "Manizales": {
    "Bogotá": 45, "Medellín": 35, "Cali": 40, "Barranquilla": 85, "Cartagena": 80,
    "Bucaramanga": 60, "Pereira": 15, "Santa Marta": 90, "Cúcuta": 75, "Ibagué": 35,
    "Villavicencio": 60, "Armenia": 20, "Montería": 70, "Neiva": 55, "Pasto": 60,
    "Sincelejo (Corozal)": 75, "Riohacha": 100, "Valledupar": 90, "Popayán": 50,
    "Tunja (Paipa)": 55, "Florencia": 70, "Yopal": 70, "Mocoa (Villagarzón)": 75,
    "San Andrés": 110, "Mitú": 115, "Puerto Carreño": 105, "Inírida": 110, "Quibdó": 45, "Leticia": 125
  },
  "Santa Marta": {
    "Bogotá": 95, "Medellín": 75, "Cali": 105, "Barranquilla": 25, "Cartagena": 35,
    "Bucaramanga": 65, "Pereira": 85, "Manizales": 90, "Cúcuta": 75, "Ibagué": 100,
    "Villavicencio": 105, "Armenia": 95, "Montería": 45, "Neiva": 105, "Pasto": 120,
    "Sincelejo (Corozal)": 40, "Riohacha": 35, "Valledupar": 30, "Popayán": 110,
    "Tunja (Paipa)": 100, "Florencia": 115, "Yopal": 100, "Mocoa (Villagarzón)": 125,
    "San Andrés": 85, "Mitú": 145, "Puerto Carreño": 125, "Inírida": 135, "Quibdó": 75, "Leticia": 155
  },
  "Cúcuta": {
    "Bogotá": 70, "Medellín": 65, "Cali": 85, "Barranquilla": 70, "Cartagena": 80,
    "Bucaramanga": 40, "Pereira": 70, "Manizales": 75, "Santa Marta": 75, "Ibagué": 75,
    "Villavicencio": 80, "Armenia": 75, "Montería": 85, "Neiva": 80, "Pasto": 100,
    "Sincelejo (Corozal)": 80, "Riohacha": 80, "Valledupar": 65, "Popayán": 90,
    "Tunja (Paipa)": 60, "Florencia": 95, "Yopal": 70, "Mocoa (Villagarzón)": 110,
    "San Andrés": 120, "Mitú": 130, "Puerto Carreño": 95, "Inírida": 110, "Quibdó": 80, "Leticia": 140
  },
  "Ibagué": {
    "Bogotá": 35, "Medellín": 40, "Cali": 45, "Barranquilla": 95, "Cartagena": 85,
    "Bucaramanga": 60, "Pereira": 30, "Manizales": 35, "Santa Marta": 100, "Cúcuta": 75,
    "Villavicencio": 45, "Armenia": 25, "Montería": 80, "Neiva": 35, "Pasto": 60,
    "Sincelejo (Corozal)": 85, "Riohacha": 105, "Valledupar": 95, "Popayán": 50,
    "Tunja (Paipa)": 40, "Florencia": 55, "Yopal": 55, "Mocoa (Villagarzón)": 65,
    "San Andrés": 115, "Mitú": 105, "Puerto Carreño": 95, "Inírida": 100, "Quibdó": 50, "Leticia": 115
  },
  "Villavicencio": {
    "Bogotá": 35, "Medellín": 60, "Cali": 70, "Barranquilla": 100, "Cartagena": 95,
    "Bucaramanga": 65, "Pereira": 55, "Manizales": 60, "Santa Marta": 105, "Cúcuta": 80,
    "Ibagué": 45, "Armenia": 50, "Montería": 90, "Neiva": 45, "Pasto": 80,
    "Sincelejo (Corozal)": 95, "Riohacha": 110, "Valledupar": 100, "Popayán": 70,
    "Tunja (Paipa)": 40, "Florencia": 55, "Yopal": 40, "Mocoa (Villagarzón)": 70,
    "San Andrés": 125, "Mitú": 85, "Puerto Carreño": 65, "Inírida": 75, "Quibdó": 70, "Leticia": 100
  },
  "Armenia": {
    "Bogotá": 40, "Medellín": 35, "Cali": 25, "Barranquilla": 90, "Cartagena": 85,
    "Bucaramanga": 60, "Pereira": 15, "Manizales": 20, "Santa Marta": 95, "Cúcuta": 75,
    "Ibagué": 25, "Villavicencio": 50, "Montería": 75, "Neiva": 45, "Pasto": 50,
    "Sincelejo (Corozal)": 80, "Riohacha": 100, "Valledupar": 90, "Popayán": 40,
    "Tunja (Paipa)": 50, "Florencia": 60, "Yopal": 60, "Mocoa (Villagarzón)": 65,
    "San Andrés": 110, "Mitú": 105, "Puerto Carreño": 100, "Inírida": 105, "Quibdó": 50, "Leticia": 115
  },
  "Montería": {
    "Bogotá": 75, "Medellín": 50, "Cali": 80, "Barranquilla": 40, "Cartagena": 35,
    "Bucaramanga": 70, "Pereira": 65, "Manizales": 70, "Santa Marta": 45, "Cúcuta": 85,
    "Ibagué": 80, "Villavicencio": 90, "Armenia": 75, "Neiva": 85, "Pasto": 95,
    "Sincelejo (Corozal)": 20, "Riohacha": 60, "Valledupar": 55, "Popayán": 85,
    "Tunja (Paipa)": 80, "Florencia": 95, "Yopal": 85, "Mocoa (Villagarzón)": 100,
    "San Andrés": 70, "Mitú": 130, "Puerto Carreño": 110, "Inírida": 120, "Quibdó": 50, "Leticia": 140
  },
  "Neiva": {
    "Bogotá": 45, "Medellín": 55, "Cali": 50, "Barranquilla": 100, "Cartagena": 90,
    "Bucaramanga": 65, "Pereira": 50, "Manizales": 55, "Santa Marta": 105, "Cúcuta": 80,
    "Ibagué": 35, "Villavicencio": 45, "Armenia": 45, "Montería": 85, "Pasto": 55,
    "Sincelejo (Corozal)": 90, "Riohacha": 110, "Valledupar": 100, "Popayán": 45,
    "Tunja (Paipa)": 50, "Florencia": 40, "Yopal": 55, "Mocoa (Villagarzón)": 50,
    "San Andrés": 120, "Mitú": 95, "Puerto Carreño": 90, "Inírida": 95, "Quibdó": 65, "Leticia": 105
  },
  "Pasto": {
    "Bogotá": 75, "Medellín": 70, "Cali": 40, "Barranquilla": 115, "Cartagena": 105,
    "Bucaramanga": 85, "Pereira": 55, "Manizales": 60, "Santa Marta": 120, "Cúcuta": 100,
    "Ibagué": 60, "Villavicencio": 80, "Armenia": 50, "Montería": 95, "Neiva": 55,
    "Sincelejo (Corozal)": 100, "Riohacha": 125, "Valledupar": 115, "Popayán": 30,
    "Tunja (Paipa)": 80, "Florencia": 60, "Yopal": 90, "Mocoa (Villagarzón)": 40,
    "San Andrés": 130, "Mitú": 90, "Puerto Carreño": 115, "Inírida": 105, "Quibdó": 75, "Leticia": 100
  },
  "Sincelejo (Corozal)": {
    "Bogotá": 80, "Medellín": 55, "Cali": 85, "Barranquilla": 35, "Cartagena": 30,
    "Bucaramanga": 65, "Pereira": 70, "Manizales": 75, "Santa Marta": 40, "Cúcuta": 80,
    "Ibagué": 85, "Villavicencio": 95, "Armenia": 80, "Montería": 20, "Neiva": 90, "Pasto": 100,
    "Riohacha": 55, "Valledupar": 50, "Popayán": 90, "Tunja (Paipa)": 85,
    "Florencia": 100, "Yopal": 90, "Mocoa (Villagarzón)": 105, "San Andrés": 75,
    "Mitú": 135, "Puerto Carreño": 115, "Inírida": 125, "Quibdó": 55, "Leticia": 145
  },
  "Riohacha": {
    "Bogotá": 100, "Medellín": 80, "Cali": 110, "Barranquilla": 45, "Cartagena": 55,
    "Bucaramanga": 70, "Pereira": 95, "Manizales": 100, "Santa Marta": 35, "Cúcuta": 80,
    "Ibagué": 105, "Villavicencio": 110, "Armenia": 100, "Montería": 60, "Neiva": 110, "Pasto": 125,
    "Sincelejo (Corozal)": 55, "Valledupar": 40, "Popayán": 115, "Tunja (Paipa)": 105,
    "Florencia": 120, "Yopal": 105, "Mocoa (Villagarzón)": 130, "San Andrés": 90,
    "Mitú": 150, "Puerto Carreño": 130, "Inírida": 140, "Quibdó": 80, "Leticia": 160
  },
  "Valledupar": {
    "Bogotá": 85, "Medellín": 70, "Cali": 100, "Barranquilla": 40, "Cartagena": 50,
    "Bucaramanga": 55, "Pereira": 85, "Manizales": 90, "Santa Marta": 30, "Cúcuta": 65,
    "Ibagué": 95, "Villavicencio": 100, "Armenia": 90, "Montería": 55, "Neiva": 100, "Pasto": 115,
    "Sincelejo (Corozal)": 50, "Riohacha": 40, "Popayán": 105, "Tunja (Paipa)": 90,
    "Florencia": 110, "Yopal": 95, "Mocoa (Villagarzón)": 120, "San Andrés": 85,
    "Mitú": 140, "Puerto Carreño": 120, "Inírida": 130, "Quibdó": 75, "Leticia": 150
  },
  "Popayán": {
    "Bogotá": 65, "Medellín": 60, "Cali": 35, "Barranquilla": 105, "Cartagena": 95,
    "Bucaramanga": 75, "Pereira": 45, "Manizales": 50, "Santa Marta": 110, "Cúcuta": 90,
    "Ibagué": 50, "Villavicencio": 70, "Armenia": 40, "Montería": 85, "Neiva": 45, "Pasto": 30,
    "Sincelejo (Corozal)": 90, "Riohacha": 115, "Valledupar": 105, "Tunja (Paipa)": 70,
    "Florencia": 55, "Yopal": 80, "Mocoa (Villagarzón)": 45, "San Andrés": 120,
    "Mitú": 85, "Puerto Carreño": 105, "Inírida": 100, "Quibdó": 65, "Leticia": 95
  },
  "Tunja (Paipa)": {
    "Bogotá": 30, "Medellín": 55, "Cali": 65, "Barranquilla": 95, "Cartagena": 85,
    "Bucaramanga": 45, "Pereira": 50, "Manizales": 55, "Santa Marta": 100, "Cúcuta": 60,
    "Ibagué": 40, "Villavicencio": 40, "Armenia": 50, "Montería": 80, "Neiva": 50, "Pasto": 80,
    "Sincelejo (Corozal)": 85, "Riohacha": 105, "Valledupar": 90, "Popayán": 70,
    "Florencia": 65, "Yopal": 45, "Mocoa (Villagarzón)": 85, "San Andrés": 125,
    "Mitú": 110, "Puerto Carreño": 80, "Inírida": 95, "Quibdó": 65, "Leticia": 120
  },
  "Florencia": {
    "Bogotá": 70, "Medellín": 75, "Cali": 65, "Barranquilla": 110, "Cartagena": 100,
    "Bucaramanga": 80, "Pereira": 65, "Manizales": 70, "Santa Marta": 115, "Cúcuta": 95,
    "Ibagué": 55, "Villavicencio": 55, "Armenia": 60, "Montería": 95, "Neiva": 40, "Pasto": 60,
    "Sincelejo (Corozal)": 100, "Riohacha": 120, "Valledupar": 110, "Popayán": 55, "Tunja (Paipa)": 65,
    "Yopal": 65, "Mocoa (Villagarzón)": 45, "San Andrés": 130,
    "Mitú": 75, "Puerto Carreño": 90, "Inírida": 85, "Quibdó": 80, "Leticia": 85
  },
  "Yopal": {
    "Bogotá": 50, "Medellín": 70, "Cali": 80, "Barranquilla": 95, "Cartagena": 90,
    "Bucaramanga": 55, "Pereira": 65, "Manizales": 70, "Santa Marta": 100, "Cúcuta": 70,
    "Ibagué": 55, "Villavicencio": 40, "Armenia": 60, "Montería": 85, "Neiva": 55, "Pasto": 90,
    "Sincelejo (Corozal)": 90, "Riohacha": 105, "Valledupar": 95, "Popayán": 80, "Tunja (Paipa)": 45, "Florencia": 65,
    "Mocoa (Villagarzón)": 80, "San Andrés": 125, "Mitú": 95, "Puerto Carreño": 55, "Inírida": 70, "Quibdó": 80, "Leticia": 110
  },
  "Mocoa (Villagarzón)": {
    "Bogotá": 80, "Medellín": 85, "Cali": 55, "Barranquilla": 120, "Cartagena": 110,
    "Bucaramanga": 95, "Pereira": 70, "Manizales": 75, "Santa Marta": 125, "Cúcuta": 110,
    "Ibagué": 65, "Villavicencio": 70, "Armenia": 65, "Montería": 100, "Neiva": 50, "Pasto": 40,
    "Sincelejo (Corozal)": 105, "Riohacha": 130, "Valledupar": 120, "Popayán": 45, "Tunja (Paipa)": 85, "Florencia": 45, "Yopal": 80,
    "San Andrés": 135, "Mitú": 70, "Puerto Carreño": 105, "Inírida": 95, "Quibdó": 85, "Leticia": 80
  },
  "San Andrés": {
    "Bogotá": 120, "Medellín": 100, "Cali": 115, "Barranquilla": 80, "Cartagena": 75,
    "Bucaramanga": 110, "Pereira": 105, "Manizales": 110, "Santa Marta": 85, "Cúcuta": 120,
    "Ibagué": 115, "Villavicencio": 125, "Armenia": 110, "Montería": 70, "Neiva": 120, "Pasto": 130,
    "Sincelejo (Corozal)": 75, "Riohacha": 90, "Valledupar": 85, "Popayán": 120, "Tunja (Paipa)": 125, "Florencia": 130, "Yopal": 125,
    "Mocoa (Villagarzón)": 135, "Mitú": 160, "Puerto Carreño": 150, "Inírida": 155, "Quibdó": 95, "Leticia": 170
  },
  "Mitú": {
    "Bogotá": 110, "Medellín": 120, "Cali": 100, "Barranquilla": 140, "Cartagena": 135,
    "Bucaramanga": 120, "Pereira": 110, "Manizales": 115, "Santa Marta": 145, "Cúcuta": 130,
    "Ibagué": 105, "Villavicencio": 85, "Armenia": 105, "Montería": 130, "Neiva": 95, "Pasto": 90,
    "Sincelejo (Corozal)": 135, "Riohacha": 150, "Valledupar": 140, "Popayán": 85, "Tunja (Paipa)": 110, "Florencia": 75, "Yopal": 95,
    "Mocoa (Villagarzón)": 70, "San Andrés": 160, "Puerto Carreño": 80, "Inírida": 65, "Quibdó": 115, "Leticia": 75
  },
  "Puerto Carreño": {
    "Bogotá": 95, "Medellín": 110, "Cali": 120, "Barranquilla": 120, "Cartagena": 115,
    "Bucaramanga": 85, "Pereira": 100, "Manizales": 105, "Santa Marta": 125, "Cúcuta": 95,
    "Ibagué": 95, "Villavicencio": 65, "Armenia": 100, "Montería": 110, "Neiva": 90, "Pasto": 115,
    "Sincelejo (Corozal)": 115, "Riohacha": 130, "Valledupar": 120, "Popayán": 105, "Tunja (Paipa)": 80, "Florencia": 90, "Yopal": 55,
    "Mocoa (Villagarzón)": 105, "San Andrés": 150, "Mitú": 80, "Inírida": 45, "Quibdó": 110, "Leticia": 95
  },
  "Inírida": {
    "Bogotá": 100, "Medellín": 115, "Cali": 110, "Barranquilla": 130, "Cartagena": 125,
    "Bucaramanga": 100, "Pereira": 105, "Manizales": 110, "Santa Marta": 135, "Cúcuta": 110,
    "Ibagué": 100, "Villavicencio": 75, "Armenia": 105, "Montería": 120, "Neiva": 95, "Pasto": 105,
    "Sincelejo (Corozal)": 125, "Riohacha": 140, "Valledupar": 130, "Popayán": 100, "Tunja (Paipa)": 95, "Florencia": 85, "Yopal": 70,
    "Mocoa (Villagarzón)": 95, "San Andrés": 155, "Mitú": 65, "Puerto Carreño": 45, "Quibdó": 110, "Leticia": 85
  },
  "Quibdó": {
    "Bogotá": 55, "Medellín": 35, "Cali": 55, "Barranquilla": 70, "Cartagena": 65,
    "Bucaramanga": 65, "Pereira": 40, "Manizales": 45, "Santa Marta": 75, "Cúcuta": 80,
    "Ibagué": 50, "Villavicencio": 70, "Armenia": 50, "Montería": 50, "Neiva": 65, "Pasto": 75,
    "Sincelejo (Corozal)": 55, "Riohacha": 80, "Valledupar": 75, "Popayán": 65, "Tunja (Paipa)": 65, "Florencia": 80, "Yopal": 80,
    "Mocoa (Villagarzón)": 85, "San Andrés": 95, "Mitú": 115, "Puerto Carreño": 110, "Inírida": 110, "Leticia": 125
  },
  "Leticia": {
    "Bogotá": 120, "Medellín": 130, "Cali": 110, "Barranquilla": 150, "Cartagena": 145,
    "Bucaramanga": 130, "Pereira": 120, "Manizales": 125, "Santa Marta": 155, "Cúcuta": 140,
    "Ibagué": 115, "Villavicencio": 100, "Armenia": 115, "Montería": 140, "Neiva": 105, "Pasto": 100,
    "Sincelejo (Corozal)": 145, "Riohacha": 160, "Valledupar": 150, "Popayán": 95, "Tunja (Paipa)": 120, "Florencia": 85, "Yopal": 110,
    "Mocoa (Villagarzón)": 80, "San Andrés": 170, "Mitú": 75, "Puerto Carreño": 95, "Inírida": 85, "Quibdó": 125
  },
  
  // ==================== VUELOS INTERNACIONALES (de regreso) ====================
  // Solo hacia orígenes permitidos: Bogotá, Medellín, Cali, Pereira, Cartagena
  "Madrid": {
    "Bogotá": 600, "Medellín": 590, "Cali": 620, "Pereira": 610, "Cartagena": 555
  },
  "Londres": {
    "Bogotá": 660, "Medellín": 650, "Cali": 680, "Pereira": 670, "Cartagena": 615
  },
  "New York": {
    "Bogotá": 330, "Medellín": 320, "Cali": 350, "Pereira": 340, "Cartagena": 290
  },
  "Buenos Aires": {
    "Bogotá": 450, "Medellín": 440, "Cali": 420, "Pereira": 430, "Cartagena": 430
  },
  "Miami": {
    "Bogotá": 240, "Medellín": 230, "Cali": 260, "Pereira": 250, "Cartagena": 195
  }
};

// Duración por defecto para rutas no definidas (en minutos)
const DURACION_DEFAULT_NACIONAL = 60; // 1 hora
const DURACION_DEFAULT_INTERNACIONAL = 480; // 8 horas

// Ciudades internacionales
const CIUDADES_INTERNACIONALES = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];

// Función para obtener la duración del vuelo en minutos
export const obtenerDuracionVuelo = (ciudadOrigen: string, ciudadDestino: string): number => {
  // Buscar en la tabla de duraciones
  if (DURACIONES_VUELO[ciudadOrigen]?.[ciudadDestino]) {
    return DURACIONES_VUELO[ciudadOrigen][ciudadDestino];
  }
  
  // Si no está definida, usar duración por defecto según si es internacional o no
  const esInternacional = CIUDADES_INTERNACIONALES.includes(ciudadOrigen) || 
                          CIUDADES_INTERNACIONALES.includes(ciudadDestino);
  
  return esInternacional ? DURACION_DEFAULT_INTERNACIONAL : DURACION_DEFAULT_NACIONAL;
};

// Función para formatear duración en texto legible
export const formatearDuracion = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

// Exportar la tabla por si se necesita en otro lugar
export { DURACIONES_VUELO, CIUDADES_INTERNACIONALES };