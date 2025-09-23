// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB...");

  // Paises
  await prisma.pais.createMany({
    data: [
      { id_pais: 1, nombre: "Colombia", iso2: "CO" },
      { id_pais: 2, nombre: "Spain", iso2: "ES" },
    ],
    skipDuplicates: true,
  });

  // GMTs
  await prisma.gmt.createMany({
    data: [
      { id_gmt: 1, name: "GMT-5", offset: -5 },
      { id_gmt: 2, name: "GMT+1", offset: 1 },
    ],
    skipDuplicates: true,
  });

  // Ciudades
  await prisma.ciudad.createMany({
    data: [
      { id_ciudad: 1, id_paisFK: 1, id_gmtFK: 1, nombre: "Bogotá", codigo: "BOG" },
      { id_ciudad: 2, id_paisFK: 1, id_gmtFK: 1, nombre: "Medellín", codigo: "MDE" },
      { id_ciudad: 3, id_paisFK: 2, id_gmtFK: 2, nombre: "Madrid", codigo: "MAD" },
      { id_ciudad: 4, id_paisFK: 1, id_gmtFK: 1, nombre: "Cartagena", codigo: "CTG" },
      { id_ciudad: 5, id_paisFK: 1, id_gmtFK: 1, nombre: "Cali", codigo: "CLO" },
    ],
    skipDuplicates: true,
  });

  // Aeropuertos
  await prisma.aeropuerto.createMany({
    data: [
      { id_aeropuerto: 1, id_ciudadFK: 1, nombre: "El Dorado", codigo_iata: "BOG" },
      { id_aeropuerto: 2, id_ciudadFK: 2, nombre: "José María Córdova", codigo_iata: "MDE" },
      { id_aeropuerto: 3, id_ciudadFK: 3, nombre: "Adolfo Suárez - Barajas", codigo_iata: "MAD" },
      { id_aeropuerto: 4, id_ciudadFK: 4, nombre: "Rafael Núñez", codigo_iata: "CTG" },
      { id_aeropuerto: 5, id_ciudadFK: 5, nombre: "Alfonso Bonilla Aragón", codigo_iata: "CLO" },
    ],
    skipDuplicates: true,
  });

  // Aeronaves
  await prisma.aeronave.createMany({
    data: [
      { id_aeronave: 1, modelo: "Airbus A320", capacidad: 180 },
      { id_aeronave: 2, modelo: "Boeing 787", capacidad: 270 },
      { id_aeronave: 3, modelo: "Embraer E190", capacidad: 100 },
    ],
    skipDuplicates: true,
  });

  // Configuración de asientos
  await prisma.configuracion_asientos.createMany({
    data: [
      { id_configuracion: 1, id_aeronaveFK: 1, clase: "economica", cantidad: 162 },
      { id_configuracion: 2, id_aeronaveFK: 1, clase: "primera_clase", cantidad: 18 },

      { id_configuracion: 3, id_aeronaveFK: 2, clase: "economica", cantidad: 240 },
      { id_configuracion: 4, id_aeronaveFK: 2, clase: "primera_clase", cantidad: 30 },

      { id_configuracion: 5, id_aeronaveFK: 3, clase: "economica", cantidad: 90 },
      { id_configuracion: 6, id_aeronaveFK: 3, clase: "primera_clase", cantidad: 10 },
    ],
    skipDuplicates: true,
  });

  // Promocion (nota: descuento entre 0 y 1)
  await prisma.promocion.createMany({
    data: [
      {
        id_promocion: 1,
        nombre: "Oferta estreno Madrid",
        descripcion: "Descuento por vuelo inaugural Bogotá–Madrid",
        descuento: 0.20, // 20%
        fecha_inicio: new Date("2025-09-25T00:00:00Z"),
        fecha_fin: new Date("2025-10-10T23:59:59Z"),
      },
    ],
    skipDuplicates: true,
  });

  // Vuelos
  await prisma.vuelo.createMany({
    data: [
      {
        id_vuelo: 1,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 1,
        id_aeropuerto_destinoFK: 2,
        salida_programada_utc: new Date("2025-10-10T12:00:00Z"),
        llegada_programada_utc: new Date("2025-10-10T13:00:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },
      {
        id_vuelo: 2,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 1,
        id_aeropuerto_destinoFK: 3,
        salida_programada_utc: new Date("2025-11-01T05:00:00Z"),
        llegada_programada_utc: new Date("2025-11-01T15:00:00Z"),
        id_promocionFK: 1,
        estado: "Programado",
      },
      {
        id_vuelo: 3,
        id_aeronaveFK: 3,
        id_aeropuerto_origenFK: 5,
        id_aeropuerto_destinoFK: 4,
        salida_programada_utc: new Date("2025-10-20T08:00:00Z"),
        llegada_programada_utc: new Date("2025-10-20T09:30:00Z"),
        id_promocionFK: null,
        estado: "Programado",
      },
    ],
    skipDuplicates: true,
  });

  // Tarifas (2 por vuelo)
  await prisma.tarifa.createMany({
    data: [
      { id_tarifa: 1, id_vueloFK: 1, clase: "economica", precio_base: 120.0 },
      { id_tarifa: 2, id_vueloFK: 1, clase: "primera_clase", precio_base: 350.0 },

      { id_tarifa: 3, id_vueloFK: 2, clase: "economica", precio_base: 450.0 },
      { id_tarifa: 4, id_vueloFK: 2, clase: "primera_clase", precio_base: 1500.0 },

      { id_tarifa: 5, id_vueloFK: 3, clase: "economica", precio_base: 80.0 },
      { id_tarifa: 6, id_vueloFK: 3, clase: "primera_clase", precio_base: 220.0 },
    ],
    skipDuplicates: true,
  });

  // Noticias (1 por vuelo)
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
    ],
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
  });
