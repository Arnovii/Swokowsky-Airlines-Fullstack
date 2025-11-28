import { PrismaClient, ticket } from "@prisma/client";

const prisma = new PrismaClient();
async function createTicketsAndPassengers(prisma: PrismaClient) {
  // configuración y helpers
  const FIRST = ['Carlos', 'Ana', 'María', 'Luis', 'Sofía', 'Andrés', 'Camila', 'Javier', 'Laura', 'Diego'];
  const LAST = ['Gómez', 'Rodríguez', 'Pérez', 'Martínez', 'López', 'Hernández', 'García', 'Torres', 'Ramírez', 'Castro'];

  function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomName() { return FIRST[randInt(0, FIRST.length - 1)]; }
  function randomLast() { return LAST[randInt(0, LAST.length - 1)]; }
  function randomDNI() { return String(randInt(10000000, 99999999)); } // como string para pasajero
  function randomPhone() { return `3${randInt(100000000, 999999999)}`; } // celular CO
  function randomEmail(name: string, last: string) {
    const n = name.toLowerCase().replace(/[^a-z]/g, '');
    const l = last.toLowerCase().replace(/[^a-z]/g, '');
    return `${n}.${l}${randInt(1, 999)}@ejemplo.com`;
  }
  function randomGender() { return Math.random() < 0.5 ? 'M' : 'F'; }
  function randomBirth() { return new Date(randInt(1950, 2005), randInt(0, 11), randInt(1, 28)); }

  function clasePorSeatId(seatId: number) {
    if (seatId <= 30) return seatId <= 18 ? 'primera_clase' : 'economica';
    if (seatId <= 80) return seatId <= 60 ? 'primera_clase' : 'economica';
    return seatId <= 90 ? 'primera_clase' : 'economica';
  }

  // usuarios permitidos (solo clientes). Ajusta ids si necesitas otros.
  const allowedUserIds = [2, 3, 5];

  const clientes = await prisma.usuario.findMany({
    where: { id_usuario: { in: allowedUserIds }, tipo_usuario: 'cliente' },
    select: { id_usuario: true, nombre: true, apellido: true, dni: true, correo: true, genero: true, fecha_nacimiento: true }
  });

  if (clientes.length === 0) {
    console.warn('No se encontraron usuarios tipo cliente con los ids esperados. Abortando creación de tickets.');
    return;
  }

  // control: máximo 5 tickets por usuario por vuelo
  const userFlightCounts: Record<string, number> = {}; // key = `${userId}-${vuelo}`

  function canTakeSeat(userId: number, vuelo: number) {
    const key = `${userId}-${vuelo}`;
    const cnt = userFlightCounts[key] ?? 0;
    if (cnt >= 5) return false;
    userFlightCounts[key] = cnt + 1;
    return true;
  }

  // Plan de creación (usa los vuelos que ya tienes: 1,4,5)
  const plan: Array<{ vuelo: number; seatStart: number; seatEnd: number; precio: number; prefix: string }> = [
    { vuelo: 1, seatStart: 1, seatEnd: 12, precio: 120.0, prefix: 'A' },   // BOG->MDE
    { vuelo: 4, seatStart: 13, seatEnd: 15, precio: 150.0, prefix: 'A' },  // MDE->CTG
    { vuelo: 5, seatStart: 31, seatEnd: 50, precio: 500.0, prefix: 'B' },  // MAD->BOG
  ];

  // rotación simple para repartir usuarios compradores (intenta ser justo)
  let nextBuyerIndex = 0;
  function pickBuyerFor(vuelo: number) {
    const tries = clientes.length;
    for (let i = 0; i < tries; i++) {
      const idx = (nextBuyerIndex + i) % clientes.length;
      const userId = clientes[idx].id_usuario;
      if (canTakeSeat(userId, vuelo)) {
        nextBuyerIndex = (idx + 1) % clientes.length;
        return userId;
      }
    }
    // todos alcanzaron 5 tickets para este vuelo
    return null;
  }

  // resumen para logs
  const resumenPorUsuario: Record<number, number[]> = {};
  for (const c of clientes) resumenPorUsuario[c.id_usuario] = [];

  // Crear tickets
  for (const p of plan) {
    for (let seatId = p.seatStart; seatId <= p.seatEnd; seatId++) {
      const buyerId = pickBuyerFor(p.vuelo);
      if (buyerId === null) {
        console.log(`Tope alcanzado: no se crean más tickets para vuelo ${p.vuelo} (asiento ${seatId}).`);
        continue;
      }

      // verificar no duplicar asiento en la DB (idempotencia)
      const asientoStr = `${p.prefix}${seatId}`;
      const exists = await prisma.ticket.findFirst({
        where: { id_vueloFK: p.vuelo, asiento_numero: asientoStr }
      });
      if (exists) {
        console.log(`Saltando asiento ${asientoStr} vuelo ${p.vuelo}: ya existe ticket id=${exists.id_ticket}`);
        // aunque no registremos resumen, evitamos crear duplicados
        continue;
      }

      // decidir si pasajero usa datos del usuario comprador (primer ticket del comprador)
      const userAlreadyUsed = resumenPorUsuario[buyerId].length > 0; // si ya tiene ticket creado antes
      let pasajeroPayload;
      if (!userAlreadyUsed) {
        // usar datos del usuario real como pasajero
        const u = clientes.find(x => x.id_usuario === buyerId)!;
        pasajeroPayload = {
          nombre: u.nombre ?? randomName(),
          apellido: u.apellido ?? randomLast(),
          dni: u.dni ? String(u.dni) : randomDNI(),
          phone: randomPhone(), // no existe teléfono en usuario: lo inventamos
          email: u.correo ?? randomEmail(u.nombre ?? 'user', u.apellido ?? 'last'),
          contact_name: `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || (u.nombre ?? randomName()),
          phone_name: randomPhone(),
          genero: (u.genero ?? randomGender()) as any,
          fecha_nacimiento: u.fecha_nacimiento ?? randomBirth(),
        };
      } else {
        // pasajero aleatorio que NO se convierte en usuario
        const fn = randomName(); const ln = randomLast();
        pasajeroPayload = {
          nombre: fn,
          apellido: ln,
          dni: randomDNI(),
          phone: randomPhone(),
          email: randomEmail(fn, ln),
          contact_name: fn,
          phone_name: randomPhone(),
          genero: randomGender() as any,
          fecha_nacimiento: randomBirth(),
        };
      }

      const estado = (p.vuelo === 5 && seatId % 7 === 0) ? 'cancelado' : 'pagado';

      try {
        const created = await prisma.ticket.create({
          data: {
            id_usuarioFK: buyerId,
            id_vueloFK: p.vuelo,
            asiento_numero: asientoStr,
            asiento_clase: clasePorSeatId(seatId) as any,
            precio: p.precio,
            estado: estado as any,
            pasajero: {
              create: pasajeroPayload
            }
          },
          include: { pasajero: true }
        });

        resumenPorUsuario[buyerId].push(created.id_ticket);
        console.log(`Ticket creado id=${created.id_ticket} vuelo=${p.vuelo} asiento=${asientoStr} usuario=${buyerId}`);
      } catch (err: any) {
        console.error('Error creando ticket (saltado):', err.message ?? err);
      }
    }
  }

  // log resumen final
  console.log('--- Resumen tickets creados por usuario (id => [tickets]) ---');
  for (const u of Object.keys(resumenPorUsuario)) {
    console.log(`${u} => ${JSON.stringify(resumenPorUsuario[Number(u)])}`);
  }

  console.log('Seeding de tickets + pasajeros finalizado.');
}
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
    ],
    skipDuplicates: true,
  });

  // GMTs
  await prisma.gmt.createMany({
    data: [
      { id_gmt: 1, name: "GMT-5", offset: -5 }, // Colombia (COT)
      { id_gmt: 2, name: "GMT+1", offset: 1 },  // España (CET / invierno)
      { id_gmt: 3, name: "GMT+0", offset: 0 },  // Reino Unido (GMT / invierno)
      { id_gmt: 4, name: "GMT-3", offset: -3 }, // Argentina (ART)
      { id_gmt: 5, name: "GMT-4", offset: -4 }, // Estados Unidos - Este (EDT, p.ej. durante DST)
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
      { id_ciudad: 31, id_paisFK: 2, id_gmtFK: 2, nombre: "Madrid", codigo: "MAD" }, // España, GMT+1 (CET en invierno)
      { id_ciudad: 32, id_paisFK: 3, id_gmtFK: 3, nombre: "Londres", codigo: "LHR" }, // Reino Unido, GMT+0 (invierno)
      { id_ciudad: 33, id_paisFK: 4, id_gmtFK: 5, nombre: "New York", codigo: "JFK" }, // EE.UU., GMT-4 (EDT — DST)
      { id_ciudad: 34, id_paisFK: 5, id_gmtFK: 4, nombre: "Buenos Aires", codigo: "EZE" }, // Argentina, GMT-3
      { id_ciudad: 35, id_paisFK: 4, id_gmtFK: 5, nombre: "Miami", codigo: "MIA" }, // EE.UU., GMT-4 (EDT — DST)
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
    ],
    skipDuplicates: true,
  });

  // Aeronaves
  await prisma.aeronave.createMany({
    data: [
      { id_aeronave: 1, modelo: "Nacional" },
      { id_aeronave: 2, modelo: "Internacional" },
    ],
    skipDuplicates: true,
  });

  // Configuración de asientos
  await prisma.configuracion_asientos.createMany({
    data: [
      // Nacional | 150 asientos -> primeras 25, economica 125
      { id_configuracion: 1, id_aeronaveFK: 1, clase: "economica", cantidad: 125 },
      { id_configuracion: 2, id_aeronaveFK: 1, clase: "primera_clase", cantidad: 25 },

      // Internacional | 250 asientos -> primeras 50, economica 200
      { id_configuracion: 3, id_aeronaveFK: 2, clase: "economica", cantidad: 200 },
      { id_configuracion: 4, id_aeronaveFK: 2, clase: "primera_clase", cantidad: 50 },
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
      {
        id_vuelo: 1,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 2, // MDE
        salida_programada_utc: new Date("2026-01-10T12:00:00Z"),
        llegada_programada_utc: new Date("2026-01-10T13:20:00Z"), // doméstico +20'
        id_promocionFK: null,
        estado: "Programado",
      },
      {
        id_vuelo: 2,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 31, // MAD
        salida_programada_utc: new Date("2026-02-01T05:00:00Z"),
        llegada_programada_utc: new Date("2026-02-01T16:00:00Z"), // internacional +60'
        id_promocionFK: 1,
        estado: "Programado",
      },
      {
        id_vuelo: 3,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 3, // CLO
        id_aeropuerto_destinoFK: 5, // CTG
        salida_programada_utc: new Date("2026-03-20T08:00:00Z"),
        llegada_programada_utc: new Date("2026-03-20T09:50:00Z"), // doméstico +20'
        id_promocionFK: null,
        estado: "Programado",
      },

      // adicionales para pruebas
      {
        id_vuelo: 4,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 2, // MDE
        id_aeropuerto_destinoFK: 5, // CTG
        salida_programada_utc: new Date("2026-04-15T14:00:00Z"),
        llegada_programada_utc: new Date("2026-04-15T16:20:00Z"), // doméstico +20'
        id_promocionFK: 2,
        estado: "Programado",
      },
      {
        id_vuelo: 5,
        id_aeronaveFK: 2,
        id_aeropuerto_origenFK: 31, // MAD
        id_aeropuerto_destinoFK: 1, // BOG
        salida_programada_utc: new Date("2025-11-29T08:00:00Z"), // > 28-nov-2025
        llegada_programada_utc: new Date("2025-11-29T19:00:00Z"), // internacional +60'
        id_promocionFK: 3,
        estado: "Programado",
      },
      {
        id_vuelo: 7,
        id_aeronaveFK: 1,
        id_aeropuerto_origenFK: 1, // BOG
        id_aeropuerto_destinoFK: 5, // CTG
        salida_programada_utc: new Date("2026-04-15T07:00:00Z"),
        llegada_programada_utc: new Date("2026-04-15T08:50:00Z"), // doméstico +20'
        id_promocionFK: 2,
        estado: "Programado",
      },
    ],

    skipDuplicates: true,
  });

  // Tarifas (dos por vuelo) — se eliminaron las tarifas relacionadas con vuelos a/de Ciudad de México
  await prisma.tarifa.createMany({
    data: [
      // vuelos 1..5,7
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
      // tarifas para vuelo 6 y 8 (Ciudad de México) eliminadas intencionalmente
      { id_tarifa: 13, id_vueloFK: 7, clase: "economica", precio_base: 360000 },
      { id_tarifa: 14, id_vueloFK: 7, clase: "primera_clase", precio_base: 1200000 },
    ],
    skipDuplicates: true,
  });

  // Noticias (una por vuelo, nuevas incluidas). Se quitaron noticias relacionadas con Ciudad de México
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
        id_noticia: 7,
        id_vueloFK: 7,
        titulo: "Más vuelos a Cartagena desde Bogotá",
        descripcion_corta: "Conectividad ampliada",
        descripcion_larga: "Sumamos una nueva frecuencia matutina entre Bogotá y Cartagena.",
        url_imagen: "https://images.pexels.com/photos/461048/pexels-photo-461048.jpeg",
      },
      // noticias que referenciaban vuelos desde/hacia Ciudad de México eliminadas intencionalmente
    ],
    skipDuplicates: true,
  });

  // Usuarios
  await prisma.usuario.createMany({
    data: [
      {
        id_usuario: 1,
        tipo_usuario: "root",
        dni: 90000001,
        nombre: "Root",
        apellido: "General",
        fecha_nacimiento: new Date("1992-07-12"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Av 5 #30-40",
        genero: "F",
        correo: "root@ejemplo.com",
        username: "anag",
        password_bash: "$2b$10$wdn1MKbEbIi//T.3Ws1aRuA0z8Pxf9gl7ofR4nM00HFsW.gc8.nLa",
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 2,
        tipo_usuario: "cliente",
        dni: 90000002,
        nombre: "Pedro",
        apellido: "Martinez",
        fecha_nacimiento: new Date("1988-11-05"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Cll 20 #10-15",
        genero: "M",
        correo: "cliente1@ejemplo.com",
        username: "pedrom",
        password_bash: "$2b$10$wdn1MKbEbIi//T.3Ws1aRuA0z8Pxf9gl7ofR4nM00HFsW.gc8.nLa",
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: false,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 3,
        tipo_usuario: "cliente",
        dni: 90000003,
        nombre: "Luisa",
        apellido: "Rodríguez",
        fecha_nacimiento: new Date("1995-06-20"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Cra 7 #40-50",
        genero: "F",
        correo: "cliente2@ejemplo.com",
        username: "luisar",
        password_bash: "$2b$10$wdn1MKbEbIi//T.3Ws1aRuA0z8Pxf9gl7ofR4nM00HFsW.gc8.nLa",
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
      {
        id_usuario: 4,
        tipo_usuario: "admin",
        dni: 90000004,
        nombre: "Admin",
        apellido: "General",
        fecha_nacimiento: new Date("1992-07-12"),
        nacionalidad: "Colombia",
        direccion_facturacion: "Av 5 #30-40",
        genero: "F",
        correo: "admin@ejemplo.com",
        username: "valentina",
        password_bash: "$2b$10$wdn1MKbEbIi//T.3Ws1aRuA0z8Pxf9gl7ofR4nM00HFsW.gc8.nLa",
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: true,
        creado_en: new Date(),
        must_change_password: false,
      },
      // Nuevo usuario añadido para que las FK de tickets funcionen
      {
        id_usuario: 5,
        tipo_usuario: "cliente",
        dni: 90000005,
        nombre: "Javier",
        apellido: "Gomez",
        fecha_nacimiento: new Date("1985-01-10"),
        nacionalidad: "Argentina",
        direccion_facturacion: "Cll Falsa 123",
        genero: "M",
        correo: "cliente3@ejemplo.com",
        username: "javierg",
        password_bash: "$2b$10$wdn1MKbEbIi//T.3Ws1aRuA0z8Pxf9gl7ofR4nM00HFsW.gc8.nLa",
        img_url: "https://res.cloudinary.com/dycqxw0aj/image/upload/v1758875237/uve00nxuv3cdyxldibkb.png",
        suscrito_noticias: false,
        creado_en: new Date(),
        must_change_password: false,
      },
    ],
    skipDuplicates: true,
  });



  //   // --- SEED: Tickets (sin referencia a asiento table) ---
  // // Vamos a simular ocupación usando asiento_numero y asiento_clase.
  // // Generamos asiento_numero siguiendo la convención anterior (A#, B#, C#)
  // // y asignamos clase según los rangos que antes usabas.

  // const ticketsData: ticket[] = [];
  // let ticketId = 1;

  // // Helper para calcular clase dado seatId (mismas reglas que antes)
  // function clasePorSeatId(seatId: number) {
  //   if (seatId <= 30) {
  //     return seatId <= 18 ? "primera_clase" : "economica"; // aeronave 1
  //   } else if (seatId <= 80) {
  //     // ids 31..80 => aeronave 2; antes primera hasta 60
  //     return seatId <= 60 ? "primera_clase" : "economica";
  //   } else {
  //     // ids 81..110 => aeronave 3; antes primera hasta 90
  //     return seatId <= 90 ? "primera_clase" : "economica";
  //   }
  // }

  // // Vuelo 1 (BOG->MDE): 12 tickets ocupados (usuarios 2..5 rotando) -> marcamos pagado
  // for (let seatId = 1; seatId <= 12; seatId++) {
  //   ticketsData.push({
  //     id_ticket: ticketId++,
  //     id_usuarioFK: 2 + ((seatId - 1) % 4), // 2,3,4,5 repeating
  //     id_vueloFK: 1,
  //     asiento_numero: `A${seatId}`, // nuevo campo (string)
  //     asiento_clase: clasePorSeatId(seatId),
  //     precio: 120.0,
  //     estado: "pagado", // usar solo estados válidos
  //     creado_en: new Date(),
  //   });
  // }

  // // Vuelo 4 (MDE->CTG): antes estaban "reservado" (ya no existe). 
  // // Si quieres simular ocupación efectiva, conviértelos a 'pagado'. Si prefieres que no cuenten, usa 'cancelado'.
  // // Aquí los convertimos a 'pagado' para simular ocupación.
  // for (let seatId = 13; seatId <= 15; seatId++) {
  //   ticketsData.push({
  //     id_ticket: ticketId++,
  //     id_usuarioFK: 3,
  //     id_vueloFK: 4,
  //     asiento_numero: `A${seatId}`,
  //     asiento_clase: clasePorSeatId(seatId),
  //     precio: 150.0,
  //     estado: "pagado", // cambiado desde 'reservado'
  //     creado_en: new Date(),
  //   });
  // }

  // // Vuelo 5 (MAD->BOG): 20 tickets, algunos 'cancelado' para simular huecos
  // for (let seatId = 31; seatId <= 50; seatId++) {
  //   ticketsData.push({
  //     id_ticket: ticketId++,
  //     id_usuarioFK: 4 + ((seatId - 31) % 2), // 4,5 repeating
  //     id_vueloFK: 5,
  //     asiento_numero: `B${seatId}`, // aeronave 2 tenía prefijo B en tu semilla original
  //     asiento_clase: clasePorSeatId(seatId),
  //     precio: 500.0,
  //     estado: seatId % 7 === 0 ? "cancelado" : "pagado", // algunos cancelados
  //     creado_en: new Date(),
  //   });
  // }

  // await prisma.ticket.createMany({
  //   data: ticketsData,
  //   skipDuplicates: true,
  // });

  await createTicketsAndPassengers(prisma);


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
