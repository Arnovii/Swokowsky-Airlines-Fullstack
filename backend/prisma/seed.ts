// prisma/seed.ts
import { asiento, PrismaClient, ticket } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB...");

  // Paises
  await prisma.pais.createMany({
    data: [
      { id_pais: 1, nombre: "Colombia", iso2: "CO" },
      { id_pais: 2, nombre: "España", iso2: "ES" },
      { id_pais: 3, nombre: "Reino Unido", iso2: "GB" },
      { id_pais: 4, nombre: "Estados Unidos", iso2: "US" },
      { id_pais: 5, nombre: "Argentina", iso2: "AR" },
      { id_pais: 6, nombre: "México", iso2: "MX" }, // Agregado México
    ],
    skipDuplicates: true,
  });

  // GMTs
  await prisma.gmt.createMany({
    data: [
      { id_gmt: 1, name: "GMT-5", offset: -5 }, // Colombia, Estados Unidos (Costa Este: NY, Miami)
      { id_gmt: 2, name: "GMT+1", offset: 1 },  // España
      { id_gmt: 3, name: "GMT+0", offset: 0 },  // Reino Unido
      { id_gmt: 4, name: "GMT-3", offset: -3 },  // Argentina
      { id_gmt: 5, name: "GMT-6", offset: -6 },  // México
    ],
    skipDuplicates: true,
  });

  // Ciudades (IDs fijos para pruebas)
  await prisma.ciudad.createMany({
    data: [
      { id_ciudad: 1, id_paisFK: 1, id_gmtFK: 1, nombre: "Bogotá", codigo: "BOG" },
      { id_ciudad: 2, id_paisFK: 1, id_gmtFK: 1, nombre: "Medellín", codigo: "MDE" },
      { id_ciudad: 3, id_paisFK: 1, id_gmtFK: 1, nombre: "Cali", codigo: "CLO" },
      { id_ciudad: 4, id_paisFK: 1, id_gmtFK: 1, nombre: "Barranquilla", codigo: "BAQ" },
      { id_ciudad: 5, id_paisFK: 1, id_gmtFK: 1, nombre: "Cartagena", codigo: "CTG" },
      { id_ciudad: 6, id_paisFK: 1, id_gmtFK: 1, nombre: "Bucaramanga", codigo: "BGA" },
      { id_ciudad: 7, id_paisFK: 1, id_gmtFK: 1, nombre: "Pereira", codigo: "PEI" },
      { id_ciudad: 8, id_paisFK: 1, id_gmtFK: 1, nombre: "Manizales", codigo: "MZL" },
      { id_ciudad: 9, id_paisFK: 1, id_gmtFK: 1, nombre: "Santa Marta", codigo: "SMR" },
      { id_ciudad: 10, id_paisFK: 1, id_gmtFK: 1, nombre: "Cúcuta", codigo: "CUC" },
      { id_ciudad: 11, id_paisFK: 1, id_gmtFK: 1, nombre: "Ibagué", codigo: "IBE" },
      { id_ciudad: 12, id_paisFK: 1, id_gmtFK: 1, nombre: "Villavicencio", codigo: "VVC" },
      { id_ciudad: 13, id_paisFK: 1, id_gmtFK: 1, nombre: "Armenia", codigo: "AXM" },
      { id_ciudad: 14, id_paisFK: 1, id_gmtFK: 1, nombre: "Montería", codigo: "MTR" },
      { id_ciudad: 15, id_paisFK: 1, id_gmtFK: 1, nombre: "Neiva", codigo: "NVA" },
      { id_ciudad: 16, id_paisFK: 1, id_gmtFK: 1, nombre: "Pasto", codigo: "PSO" },
      { id_ciudad: 17, id_paisFK: 1, id_gmtFK: 1, nombre: "Sincelejo (Corozal)", codigo: "CZU" },
      { id_ciudad: 18, id_paisFK: 1, id_gmtFK: 1, nombre: "Riohacha", codigo: "RCH" },
      { id_ciudad: 19, id_paisFK: 1, id_gmtFK: 1, nombre: "Valledupar", codigo: "VUP" },
      { id_ciudad: 20, id_paisFK: 1, id_gmtFK: 1, nombre: "Popayán", codigo: "PPN" },
      { id_ciudad: 21, id_paisFK: 1, id_gmtFK: 1, nombre: "Tunja (Paipa)", codigo: "PYA" },
      { id_ciudad: 22, id_paisFK: 1, id_gmtFK: 1, nombre: "Florencia", codigo: "FLA" },
      { id_ciudad: 23, id_paisFK: 1, id_gmtFK: 1, nombre: "Yopal", codigo: "EYP" },
      { id_ciudad: 24, id_paisFK: 1, id_gmtFK: 1, nombre: "Mocoa (Villagarzón)", codigo: "VGZ" },
      { id_ciudad: 25, id_paisFK: 1, id_gmtFK: 1, nombre: "San Andrés", codigo: "ADZ" },
      { id_ciudad: 26, id_paisFK: 1, id_gmtFK: 1, nombre: "Mitú", codigo: "MVP" },
      { id_ciudad: 27, id_paisFK: 1, id_gmtFK: 1, nombre: "Puerto Carreño", codigo: "PCR" },
      { id_ciudad: 28, id_paisFK: 1, id_gmtFK: 1, nombre: "Inírida", codigo: "PDA" },
      { id_ciudad: 29, id_paisFK: 1, id_gmtFK: 1, nombre: "Quibdó", codigo: "UIB" },
      { id_ciudad: 30, id_paisFK: 1, id_gmtFK: 1, nombre: "Leticia", codigo: "LET" },

      // --- Ciudades Internacionales ---
      { id_ciudad: 31, id_paisFK: 2, id_gmtFK: 2, nombre: "Madrid", codigo: "MAD" }, // España, GMT+1
      { id_ciudad: 32, id_paisFK: 3, id_gmtFK: 3, nombre: "Londres", codigo: "LHR" }, // Reino Unido, GMT+0
      { id_ciudad: 33, id_paisFK: 4, id_gmtFK: 1, nombre: "New York", codigo: "JFK" }, // EE.UU., GMT-5
      { id_ciudad: 34, id_paisFK: 5, id_gmtFK: 4, nombre: "Buenos Aires", codigo: "EZE" }, // Argentina, GMT-3
      { id_ciudad: 35, id_paisFK: 4, id_gmtFK: 1, nombre: "Miami", codigo: "MIA" }, // EE.UU., GMT-5
      { id_ciudad: 36, id_paisFK: 6, id_gmtFK: 5, nombre: "Ciudad de México", codigo: "MEX" }, // México, GMT-6
      
    ],
    skipDuplicates: true,
  });

  // Aeropuertos
  await prisma.aeropuerto.createMany({
    data: [
      { id_aeropuerto: 1, id_ciudadFK: 1, nombre: "El Dorado", codigo_iata: "BOG" },
      { id_aeropuerto: 2, id_ciudadFK: 2, nombre: "José María Córdova", codigo_iata: "MDE" },
      { id_aeropuerto: 3, id_ciudadFK: 3, nombre: "Alfonso Bonilla Aragón", codigo_iata: "CLO" },
      { id_aeropuerto: 4, id_ciudadFK: 4, nombre: "Ernesto Cortissoz", codigo_iata: "BAQ" },
      { id_aeropuerto: 5, id_ciudadFK: 5, nombre: "Rafael Núñez", codigo_iata: "CTG" },
      { id_aeropuerto: 6, id_ciudadFK: 6, nombre: "Palonegro", codigo_iata: "BGA" },
      { id_aeropuerto: 7, id_ciudadFK: 7, nombre: "Matecaña", codigo_iata: "PEI" },
      { id_aeropuerto: 8, id_ciudadFK: 8, nombre: "La Nubia", codigo_iata: "MZL" },
      { id_aeropuerto: 9, id_ciudadFK: 9, nombre: "Simón Bolívar", codigo_iata: "SMR" },
      { id_aeropuerto: 10, id_ciudadFK: 10, nombre: "Camilo Daza", codigo_iata: "CUC" },
      { id_aeropuerto: 11, id_ciudadFK: 11, nombre: "Perales", codigo_iata: "IBE" },
      { id_aeropuerto: 12, id_ciudadFK: 12, nombre: "La Vanguardia", codigo_iata: "VVC" },
      { id_aeropuerto: 13, id_ciudadFK: 13, nombre: "El Edén", codigo_iata: "AXM" },
      { id_aeropuerto: 14, id_ciudadFK: 14, nombre: "Los Garzones", codigo_iata: "MTR" },
      { id_aeropuerto: 15, id_ciudadFK: 15, nombre: "Benito Salas", codigo_iata: "NVA" },
      { id_aeropuerto: 16, id_ciudadFK: 16, nombre: "Antonio Nariño", codigo_iata: "PSO" },
      { id_aeropuerto: 17, id_ciudadFK: 17, nombre: "Las Brujas", codigo_iata: "CZU" },
      { id_aeropuerto: 18, id_ciudadFK: 18, nombre: "Almirante Padilla", codigo_iata: "RCH" },
      { id_aeropuerto: 19, id_ciudadFK: 19, nombre: "Alfonso López Pumarejo", codigo_iata: "VUP" },
      { id_aeropuerto: 20, id_ciudadFK: 20, nombre: "Guillermo León Valencia", codigo_iata: "PPN" },
      { id_aeropuerto: 21, id_ciudadFK: 21, nombre: "Juan José Rondón", codigo_iata: "PYA" },
      { id_aeropuerto: 22, id_ciudadFK: 22, nombre: "Gustavo Artunduaga Paredes", codigo_iata: "FLA" },
      { id_aeropuerto: 23, id_ciudadFK: 23, nombre: "El Alcaraván", codigo_iata: "EYP" },
      { id_aeropuerto: 24, id_ciudadFK: 24, nombre: "Villa Garzón", codigo_iata: "VGZ" },
      { id_aeropuerto: 25, id_ciudadFK: 25, nombre: "Gustavo Rojas Pinilla", codigo_iata: "ADZ" },
      { id_aeropuerto: 26, id_ciudadFK: 26, nombre: "Fabio Alberto León Bentley", codigo_iata: "MVP" },
      { id_aeropuerto: 27, id_ciudadFK: 27, nombre: "Germán Olano", codigo_iata: "PCR" },
      { id_aeropuerto: 28, id_ciudadFK: 28, nombre: "César Gaviria Trujillo", codigo_iata: "PDA" },
      { id_aeropuerto: 29, id_ciudadFK: 29, nombre: "El Caraño", codigo_iata: "UIB" },
      { id_aeropuerto: 30, id_ciudadFK: 30, nombre: "Alfredo Vásquez Cobo", codigo_iata: "LET" },

      // --- Aeropuertos Internacionales ---
      { id_aeropuerto: 31, id_ciudadFK: 31, nombre: "Adolfo Suárez Madrid-Barajas", codigo_iata: "MAD" },
      { id_aeropuerto: 32, id_ciudadFK: 32, nombre: "Heathrow", codigo_iata: "LHR" },
      { id_aeropuerto: 33, id_ciudadFK: 33, nombre: "John F. Kennedy", codigo_iata: "JFK" },
      { id_aeropuerto: 34, id_ciudadFK: 34, nombre: "Ministro Pistarini", codigo_iata: "EZE" },
      { id_aeropuerto: 35, id_ciudadFK: 35, nombre: "Internacional de Miami", codigo_iata: "MIA" },
      { id_aeropuerto: 36, id_ciudadFK: 36, nombre: "Benito Juárez", codigo_iata: "MEX" }, // Ciudad de México
    ],
    skipDuplicates: true,
  });

  // Aeronaves (corregidas para que la suma de configuracion_asientos coincida con capacidad)
  await prisma.aeronave.createMany({
    data: [
      { id_aeronave: 1, modelo: "Airbus A320", capacidad: 180 },
      { id_aeronave: 2, modelo: "Boeing 787", capacidad: 270 },
      { id_aeronave: 3, modelo: "Embraer E190", capacidad: 100 },
    ],
    skipDuplicates: true,
  });

  // Configuración de asientos (sumas = capacidad)
  await prisma.configuracion_asientos.createMany({
    data: [
      // A320
      { id_configuracion: 1, id_aeronaveFK: 1, clase: "economica", cantidad: 162 },
      { id_configuracion: 2, id_aeronaveFK: 1, clase: "primera_clase", cantidad: 18 },

      // 787
      { id_configuracion: 3, id_aeronaveFK: 2, clase: "economica", cantidad: 240 },
      { id_configuracion: 4, id_aeronaveFK: 2, clase: "primera_clase", cantidad: 30 },

      // E190
      { id_configuracion: 5, id_aeronaveFK: 3, clase: "economica", cantidad: 90 },
      { id_configuracion: 6, id_aeronaveFK: 3, clase: "primera_clase", cantidad: 10 },
    ],
    skipDuplicates: true,
  });

  // Promociones (descuento entre 0 y 1)
  await prisma.promocion.createMany({
    data: [
      {
        id_promocion: 1,
        nombre: "Oferta estreno Madrid",
        descripcion: "Descuento por vuelo inaugural Bogotá–Madrid",
        descuento: 0.20,
        fecha_inicio: new Date("2025-09-25T00:00:00Z"),
        fecha_fin: new Date("2025-10-10T23:59:59Z"),
      },
      {
        id_promocion: 2,
        nombre: "Promo Caribe",
        descripcion: "Viaja a Cartagena con descuento",
        descuento: 0.15,
        fecha_inicio: new Date("2025-10-01T00:00:00Z"),
        fecha_fin: new Date("2025-11-01T23:59:59Z"),
      },
      {
        id_promocion: 3,
        nombre: "Black Friday",
        descripcion: "Descuento masivo",
        descuento: 0.30,
        fecha_inicio: new Date("2025-11-25T00:00:00Z"),
        fecha_fin: new Date("2025-11-30T23:59:59Z"),
      },
    ],
    skipDuplicates: true,
  });

  // Vuelos CORREGIDOS - todas las referencias de aeropuertos ahora existen
  await prisma.vuelo.createMany({
    data: [
      // existentes
      {
        id_vuelo: 1,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 2, // MDE
        salida_programada_utc: new Date("2025-10-10T12:00:00Z"),
        llegada_programada_utc: new Date("2025-10-10T13:00:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },
      {
        id_vuelo: 2,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 31, // MAD - CORREGIDO: era 3 (CLO)
        salida_programada_utc: new Date("2025-11-01T05:00:00Z"),
        llegada_programada_utc: new Date("2025-11-01T15:00:00Z"),
        id_promocionFK: 1,
        estado: "Programado",
      },
      {
        id_vuelo: 3,
        id_aeronaveFK: 3,
        id_aeropuerto_origenFK: 3, // CLO - CORREGIDO: era 5 (CTG)
        id_aeropuerto_destinoFK: 5, // CTG - CORREGIDO: era 4 (BAQ)
        salida_programada_utc: new Date("2025-10-20T08:00:00Z"),
        llegada_programada_utc: new Date("2025-10-20T09:30:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },

      // adicionales para pruebas
      {
        id_vuelo: 4,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 2, // MDE
        id_aeropuerto_destinoFK: 5, // CTG - CORREGIDO: era 4 (BAQ)
        salida_programada_utc: new Date("2025-10-15T14:00:00Z"),
        llegada_programada_utc: new Date("2025-10-15T16:00:00Z"),
        id_promocionFK: 2,
        estado: "Programado",
      },
      {
        id_vuelo: 5,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 31, // MAD - CORREGIDO: era 3 (CLO)
        id_aeropuerto_destinoFK: 1, // BOG
        salida_programada_utc: new Date("2025-11-28T08:00:00Z"),
        llegada_programada_utc: new Date("2025-11-28T18:00:00Z"),
        id_promocionFK: 3,
        estado: "Programado",
      },
      {
        id_vuelo: 6,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 36, // MEX - CORREGIDO: era 6 (BGA)
        salida_programada_utc: new Date("2025-12-05T06:00:00Z"),
        llegada_programada_utc: new Date("2025-12-05T12:00:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },
      {
        id_vuelo: 7,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 5, // CTG - CORREGIDO: era 4 (BAQ)
        salida_programada_utc: new Date("2025-10-15T07:00:00Z"),
        llegada_programada_utc: new Date("2025-10-15T08:30:00Z"),
        id_promocionFK: 2,
        estado: "Programado",
      },
      {
        id_vuelo: 8,
        id_aeronaveFK: 3,
        id_aeropuerto_origenFK: 36, // MEX - CORREGIDO: era 6 (BGA)
        id_aeropuerto_destinoFK: 1, // BOG
        salida_programada_utc: new Date("2025-12-06T13:00:00Z"),
        llegada_programada_utc: new Date("2025-12-06T19:00:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },
    ],
    skipDuplicates: true,
  });

  // Tarifas (dos por vuelo)
  await prisma.tarifa.createMany({
    data: [
      // vuelos 1..8
      { id_tarifa: 1, id_vueloFK: 1, clase: "economica", precio_base: 480000 },     
      { id_tarifa: 2, id_vueloFK: 1, clase: "primera_clase", precio_base: 1400000 },  
      { id_tarifa: 3, id_vueloFK: 2, clase: "economica", precio_base: 1800000 },    
      { id_tarifa: 4, id_vueloFK: 2, clase: "primera_clase", precio_base: 6000000 },  
      { id_tarifa: 5, id_vueloFK: 3, clase: "economica", precio_base: 320000 },     
      { id_tarifa: 6, id_vueloFK: 3, clase: "primera_clase", precio_base: 880000 },   
      { id_tarifa: 7, id_vueloFK: 4, clase: "economica", precio_base: 600000 },     
      { id_tarifa: 8, id_vueloFK: 4, clase: "primera_clase", precio_base: 1600000 },  
      { id_tarifa: 9, id_vueloFK: 5, clase: "economica", precio_base: 2000000 },    
      { id_tarifa: 10, id_vueloFK: 5, clase: "primera_clase", precio_base: 6800000 }, 
      { id_tarifa: 11, id_vueloFK: 6, clase: "economica", precio_base: 2400000 },    
      { id_tarifa: 12, id_vueloFK: 6, clase: "primera_clase", precio_base: 7200000 }, 
      { id_tarifa: 13, id_vueloFK: 7, clase: "economica", precio_base: 360000 },     
      { id_tarifa: 14, id_vueloFK: 7, clase: "primera_clase", precio_base: 1200000 },  
      { id_tarifa: 15, id_vueloFK: 8, clase: "economica", precio_base: 2200000 },    
      { id_tarifa: 16, id_vueloFK: 8, clase: "primera_clase", precio_base: 5200000 }, 
    ],
    skipDuplicates: true,
  });

  // Noticias (una por vuelo, nuevas incluidas)
  await prisma.noticia.createMany({
    data: [
      {
        id_noticia: 1,
        id_vueloFK: 1,
        titulo: "Nuevo vuelo directo Bogotá — Medellín",
        descripcion_corta: "Conecta Bogotá y Medellín en 1 hora",
        descripcion_larga:
          "A partir de octubre, lanzamos un nuevo servicio directo entre Bogotá y Medellín con cómodos horarios y tarifas competitivas.",
        url_imagen: "https://images.pexels.com/photos/3535926/pexels-photo-3535926.jpeg",
      },
      {
        id_noticia: 2,
        id_vueloFK: 2,
        titulo: "Vuela Bogotá — Madrid: oferta inaugural",
        descripcion_corta: "Estreno de la ruta con descuento limitado",
        descripcion_larga:
          "Inauguramos la ruta Bogotá - Madrid con tarifas especiales por tiempo limitado. Reserva antes del 10/10 para aprovechar la promoción.",
        url_imagen: "https://images.pexels.com/photos/670261/pexels-photo-670261.jpeg",
      },
      {
        id_noticia: 3,
        id_vueloFK: 3,
        titulo: "Rutas regionales: Cali — Cartagena",
        descripcion_corta: "Más conectividad entre ciudades costeras",
        descripcion_larga:
          "Nueva frecuencia regional entre Cali y Cartagena para mejorar la conectividad del suroccidente con la costa caribe.",
        url_imagen: "https://images.pexels.com/photos/33979920/pexels-photo-33979920.jpeg",
      },
      {
        id_noticia: 4,
        id_vueloFK: 4,
        titulo: "Nueva ruta Medellín — Cartagena",
        descripcion_corta: "Vuela directo al Caribe",
        descripcion_larga:
          "Nuestra aerolínea inaugura un vuelo directo entre Medellín y Cartagena, con tarifas promocionales.",
        url_imagen: "https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg",
      },
      {
        id_noticia: 5,
        id_vueloFK: 5,
        titulo: "Black Friday: Madrid — Bogotá",
        descripcion_corta: "Descuentos hasta 30%",
        descripcion_larga:
          "Por Black Friday, aprovecha hasta un 30% de descuento en vuelos seleccionados entre Madrid y Bogotá. Solo del 25 al 30 de noviembre.",
        url_imagen: "https://images.pexels.com/photos/1309644/pexels-photo-1309644.jpeg",
      },
      {
        id_noticia: 6,
        id_vueloFK: 6,
        titulo: "Nuevos vuelos Bogotá — Ciudad de México",
        descripcion_corta: "Conexión directa con México",
        descripcion_larga: "Lanzamos ruta directa entre Bogotá y Ciudad de México con excelentes horarios.",
        url_imagen: "https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg",
      },
      {
        id_noticia: 7,
        id_vueloFK: 7,
        titulo: "Más vuelos a Cartagena desde Bogotá",
        descripcion_corta: "Conectividad ampliada",
        descripcion_larga: "Sumamos una nueva frecuencia matutina entre Bogotá y Cartagena.",
        url_imagen: "https://images.pexels.com/photos/461048/pexels-photo-461048.jpeg",
      },
      {
        id_noticia: 8,
        id_vueloFK: 8,
        titulo: "Vuelo Ciudad de México — Bogotá: nueva frecuencia",
        descripcion_corta: "Más opciones desde México",
        descripcion_larga: "Incrementamos capacidad en la ruta Ciudad de México — Bogotá.",
        url_imagen: "https://images.pexels.com/photos/373067/pexels-photo-373067.jpeg",
      },
    ],
    skipDuplicates: true,
  });

  // Usuarios (admin + clientes)
  await prisma.usuario.createMany({
    data: [
      {
        id_usuario: 1,
        tipo_usuario: "admin",
        dni: 90000001,
        nombre: "Admin",
        apellido: "General",
        fecha_nacimiento: new Date("1992-07-12"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Av 5 #30-40",
        genero: "F",
        correo: "ana.gomez@example.com",
        username: "anag",
        password_bash: "ana_pass_hashed",
        img_url: "",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 4,
        tipo_usuario: "cliente",
        dni: 90000004,
        nombre: "Pedro",
        apellido: "Martinez",
        fecha_nacimiento: new Date("1988-11-05"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Cll 20 #10-15",
        genero: "M",
        correo: "pedro.m@example.com",
        username: "pedrom",
        password_bash: "pedro_pass_hashed",
        img_url: "",
        suscrito_noticias: false,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 5,
        tipo_usuario: "cliente",
        dni: 90000005,
        nombre: "Luisa",
        apellido: "Rodríguez",
        fecha_nacimiento: new Date("1995-06-20"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Cra 7 #40-50",
        genero: "F",
        correo: "luisa.r@example.com",
        username: "luisar",
        password_bash: "luisa_pass_hashed",
        img_url: "",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 6,
        tipo_usuario: "admin",
        dni: "90000001",
        nombre: "Admin",
        apellido: "General",
        fecha_nacimiento: new Date("1992-07-12"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Av 5 #30-40",
        genero: "F",
        correo: "juana.martinez@utp.edu.co",
        username: "valentina",
        password_bash: "a123456789",
        img_url: "",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
    ],
    skipDuplicates: true,
  });

  // Asientos (creamos asientos "representativos" — no todos, pero suficientes para tickets de prueba)
  const asientoData: asiento[]  = [];

  // aeronave 1: asientos 1..30
  for (let i = 1; i <= 30; i++) {
    asientoData.push({
      id_asiento: i,
      id_aeronaveFK: 1,
      numero: `A${i}`,
      clases: i <= 18 ? "primera_clase" : "economica", // primeras 18 son primera_clase
    });
  }

  // aeronave 2: asientos 31..80 (50 asientos creados)
  for (let i = 31; i <= 80; i++) {
    asientoData.push({
      id_asiento: i,
      id_aeronaveFK: 2,
      numero: `B${i}`,
      clases: i <= 60 ? "primera_clase" : "economica", // approx: primeros 30 -> primera_clase (ids 31..60)
    });
  }

  // aeronave 3: asientos 81..110 (30 asientos)
  for (let i = 81; i <= 110; i++) {
    asientoData.push({
      id_asiento: i,
      id_aeronaveFK: 3,
      numero: `C${i}`,
      clases: i <= 90 ? "primera_clase" : "economica", // small split
    });
  }

  await prisma.asiento.createMany({
    data: asientoData,
    skipDuplicates: true,
  });

  // Tickets (simulamos ocupación en vuelos)
  // Para vuelo 1 (BOG->MDE) creamos 12 tickets ocupados (usuarios 2..5 rotando)
  const ticketsData: ticket[] = [];
  let ticketId = 1;

  for (let seatId = 1; seatId <= 12; seatId++) {
    ticketsData.push({
      id_ticket: ticketId++,
      id_usuarioFK: 2 + ((seatId - 1) % 4), // 2,3,4,5 repeating
      id_vueloFK: 1,
      id_asientoFK: seatId,
      precio: 120.0,
      estado: "pagado",
      creado_en: new Date(),
    });
  }

  // Para vuelo 4 (MDE->CTG) creamos 3 tickets
  for (let seatId = 13; seatId <= 15; seatId++) {
    ticketsData.push({
      id_ticket: ticketId++,
      id_usuarioFK: 3,
      id_vueloFK: 4,
      id_asientoFK: seatId,
      precio: 150.0,
      estado: "reservado",
      creado_en: new Date(),
    });
  }

  // Para vuelo 5 (MAD->BOG) hacemos 20 tickets para simular alta ocupación
  for (let seatId = 31; seatId <= 50; seatId++) {
    ticketsData.push({
      id_ticket: ticketId++,
      id_usuarioFK: 4 + ((seatId - 31) % 2), // 4,5 repeating
      id_vueloFK: 5,
      id_asientoFK: seatId,
      precio: 500.0,
      estado: seatId % 7 === 0 ? "cancelado" : "pagado", // algunos cancelados
      creado_en: new Date(),
    });
  }

  await prisma.ticket.createMany({
    data: ticketsData,
    skipDuplicates: true,
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })