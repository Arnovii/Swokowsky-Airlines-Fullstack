import { Injectable, BadRequestException, Logger, forwardRef } from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto';
import { MailService } from '../../mail/mail.service';
import { CartService } from '../cart/cart.service';
import { UsersService } from '../users/users.service';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { PrismaService } from '../../database/prisma.service';
import { usuario, ticket_estado, asiento_clases, configuracion_asientos } from '@prisma/client';
import type { ticket } from '@prisma/client';
import type { Prisma } from '@prisma/client';
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly cartService: CartService,
    private readonly userService: UsersService,
    private readonly prisma: PrismaService
  ) { }

  /**
   * Calcula el total del carrito consultando tarifas actuales en DB.
   * Retorna { total, detalles: [{ id_vuelo, clase, precio_unitario, cantidad }] }
   *
   * Asunción: cartItemsList es un array de carrito_item tal como lo retorna cartService.getCart()
   * Cada item: { id_item_carrito, id_vueloFK, cantidad_de_tickets, clase, fecha_limite, ... }
   */
  calculateTotalCart = async (cartItemsList: any[]) => {
    let total = 0;
    const detalles: Array<any> = [];

    for (const item of cartItemsList) {
      const vueloId = item.id_vueloFK ?? item.vueloID ?? item.vueloId;
      const clase: asiento_clases = item.clase;
      const cantidad = item.cantidad_de_tickets ?? item.CantidadDePasajeros ?? 0;

      if (!vueloId) {
        throw new BadRequestException('Carrito contiene item sin vueloID');
      }

      // obtener tarifa actual para ese vuelo y clase
      const tarifa = await this.prisma.tarifa.findFirst({
        where: { id_vueloFK: vueloId, clase: clase }
      });

      if (!tarifa) {
        throw new BadRequestException(`No hay tarifa configurada para el vuelo ${vueloId} clase ${clase}`);
      }

      const subtotal = tarifa.precio_base * cantidad;
      detalles.push({ id_vuelo: vueloId, clase, precio_unitario: tarifa.precio_base, cantidad, subtotal });
      total += subtotal;
    }

    return { total, detalles };
  }

  deleteItemsCart = async (idCarrito: number | null) => {
    if (idCarrito) {
      await this.prisma.carrito_item.deleteMany({ where: { id_carritoFK: idCarrito } });
    }
    else {
      throw new BadRequestException('Carrito no existente');
    }
  }

  getCarritoIdByUsuarioId = async (idUsuario: number) => {
    let carrito = await this.prisma.carrito.findUnique({ where: { id_usuarioFK: idUsuario } });
    return carrito ? carrito.id_carrito : null;
  }

  /**
   * Determina si un vuelo es internacional o nacional
   * Internacional: id_aeronaveFK = 2 Y una de las ciudades es Miami, Buenos Aires, New York, Londres o Madrid
   * Nacional: id_aeronaveFK = 1
   */
  private async determineFlightType(vuelo: any): Promise<'nacional' | 'internacional'> {
    if (vuelo.id_aeronaveFK === 1) return 'nacional';
    if (vuelo.id_aeronaveFK === 2) {
      // Verificar si alguna ciudad del vuelo es internacional
      const ciudadesInternacionales = ['Miami', 'Buenos Aires', 'New York', 'Londres', 'Madrid'];
      const ciudadOrigen = vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.ciudad?.nombre;
      const ciudadDestino = vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.ciudad?.nombre;

      if (ciudadesInternacionales.includes(ciudadOrigen) || ciudadesInternacionales.includes(ciudadDestino)) {
        return 'internacional';
      }
    }
    return 'nacional';
  }

  /**
   * Genera lista de todos los asientos posibles para una clase en un vuelo
   * Nacional primera_clase: A1 hasta A5 (25 asientos)
   * Nacional economica: B5 hasta F25 (125 asientos)
   * Internacional primera_clase: A1 hasta B9 (50 asientos)
   * Internacional economica: C9 hasta D42 (200 asientos)
   */
  private async generateAllSeatsForClass(
    flightType: 'nacional' | 'internacional',
    claseTarget: asiento_clases,
    preLoadedConfig?: Record<string, number> // <--- Nuevo parámetro opcional
  ): Promise<string[]> {
    const seats: string[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const totalColumns = columns.length;

    let mapaAsientos: Record<string, number>;

    // OPTIMIZACIÓN: Si ya nos pasan la config, la usamos. Si no, vamos a la BD.
    if (preLoadedConfig) {
      mapaAsientos = preLoadedConfig;
    } else {
      // --- Lógica original de acceso a BD (Fallback) ---

      // 1. Determinar ID del avión
      const idAirplane = flightType === 'nacional' ? 1 : 2;

      // 2. Obtener configuración
      let configuracionesDB: configuracion_asientos[] = [];
      try {
        configuracionesDB = await this.prisma.configuracion_asientos.findMany({
          where: { id_aeronaveFK: idAirplane },
          orderBy: { id_configuracion: 'asc' }
        });

        if (!configuracionesDB.length) throw new Error('Aeronave sin configuración.');
      } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        throw error;
      }

      // 3. Crear el Mapa
      mapaAsientos = configuracionesDB.reduce((acc, curr) => {
        acc[curr.clase] = curr.cantidad;
        return acc;
      }, {} as Record<string, number>);
    }

    // --- De aquí en adelante la lógica de cálculo matemático es IDÉNTICA ---

    // Validamos que exista la clase
    if (mapaAsientos[claseTarget] === undefined) {
      throw new Error(`La clase ${claseTarget} no existe en esta aeronave.`);
    }

    // 4. Calcular dinámicamente el inicio
    let firstRow = 1;
    let firstColumnIndex = 0;

    if (claseTarget === 'economica') {
      const asientosPrevios = mapaAsientos['primera_clase'] || 0;
      firstRow = Math.floor(asientosPrevios / totalColumns) + 1;
      firstColumnIndex = asientosPrevios % totalColumns;
    }

    // 5. Calcular límites y generar
    const cantidadAsientosA_Generar = mapaAsientos[claseTarget];
    let asientosGeneradosCount = 0;
    let currentRow = firstRow;
    let currentStartCol = firstColumnIndex;

    while (asientosGeneradosCount < cantidadAsientosA_Generar) {
      for (let col = currentStartCol; col < totalColumns; col++) {
        if (asientosGeneradosCount >= cantidadAsientosA_Generar) break;

        seats.push(`${columns[col]}${currentRow}`);
        asientosGeneradosCount++;
      }
      currentStartCol = 0;
      currentRow++;
    }

    return seats;
  }
  // private async generateAllSeatsForClass(flightType: 'nacional' | 'internacional', clase: asiento_clases): Promise<string[]> {
  //   const seats: string[] = [];
  //   const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  //   const idAirplane = flightType === 'nacional' ? 1 : 2;
  //   let configuracion: configuracion_asientos | null = null;

  //   //Configuración de asientos según tipo de vuelo y clase
  //   try {
  //     configuracion = await this.prisma.configuracion_asientos.findFirst({
  //       where: {
  //         id_aeronaveFK: idAirplane,  // Filtramos por id_aeronave
  //         clase: clase                 // Filtramos por clase de asiento
  //       }
  //     });
  //     if (!configuracion) throw new Error('No se encontró configuración de asientos para la aeronave y clase especificadas.');
  //   }catch (error) {
  //     console.error('Error al obtener configuración de asientos:', error);
  //     throw error;
  //   }

  //   //Calcular la última fila y su cantidad de asientos 
  //   const totalSeats = configuracion.cantidad;
  //   const totalColumns = columns.length;
  //   const lastRow = Math.ceil(totalSeats/totalColumns);

  //   const firstRow:number = flightType === 'nacional' ? (clase === 'primera_clase' ? 1 : 5) : (clase === 'primera_clase' ? 1 : 9);
  //   const firstColumnIndex:number = flightType === 'nacional' ? (clase === 'primera_clase' ? 0 : 1) : (clase === 'primera_clase' ? 0 : 2);

  //   if (flightType === 'nacional') {
  //     if (clase === 'primera_clase') {
  //       // A1 hasta A5 (25 asientos totales. 4 filas x 6 columnas = 24 asientos + 1 asiento en fila 5)
  //       for (let row = firstRow; row <= lastRow; row++) {
  //         for(let col = firstColumnIndex; col < totalColumns; col++) {
  //           if (seats.length >= totalSeats) break;
  //           seats.push(`${columns[col]}${row}`);
  //         }
  //       }
  //     } else {
  //       // B5 hasta F25 (125 asientos totales. 21 filas. primer fila 5 asientos, luego 20 filas completas) 
  //       for (let row = firstRow; row <= lastRow; row++) {
  //         for (let col = firstColumnIndex; col < totalColumns; col++) {
  //           if (seats.length >= totalSeats) break;

  //           //agregar condicion de primera fila (ya que nunca es completa debido a la primera clase)
  //           seats.push(`${columns[col]}${row}`);
  //         }
  //       }
  //     }
  //   } else {
  //     // Internacional
  //     if (clase === 'primera_clase') {
  //       // A1 hasta B9 (50 asientos: 2 columnas x 25 filas) // 🔴 (6 columnas x 8 filas. La novena fila solo 2 columnas)


  //       //Desde configuración de asientos determinados 

  //       for (let row = 1; row <= 25; row++) {
  //         for (let col = 0; col < 2; col++) { 
  //           seats.push(`${columns[col]}${row}`);
  //         }
  //       }
  //     } else {
  //       // C9 hasta D42 (200 asientos: 2 columnas x 100 filas, pero el rango es C hasta D)
  //       for (let row = 1; row <= 100; row++) {
  //         for (let col = 2; col < 4; col++) {
  //           seats.push(`${columns[col]}${row}`);
  //         }
  //       }
  //     }
  //   }
  //   return seats;
  // }

  /**
   * Obtiene asientos ocupados para un vuelo y clase específicos
   * Busca todos los tickets pagados y los retorna como set para búsqueda O(1)
   */
  private async getOccupiedSeats(vueloID: number, clase: asiento_clases): Promise<Set<string>> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id_vueloFK: vueloID,
        asiento_clase: clase,
        estado: 'pagado'
      },
      select: { asiento_numero: true }
    });
    return new Set(tickets.map(t => t.asiento_numero).filter(s => s));
  }

  /**
   * Selecciona N asientos aleatorios de una lista de disponibles
   * Retorna array sin duplicados y sin asientos ocupados
   */
  private selectRandomSeats(availableSeats: string[], count: number): string[] {
    if (availableSeats.length < count) {
      throw new Error(`No hay suficientes asientos disponibles. Disponibles: ${availableSeats.length}, Solicitados: ${count}`);
    }

    const shuffled = [...availableSeats].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * processCheckout: main flow
   * - Valida usuario y saldo
   * - Calcula total (consulta tarifa)
   * - Genera tickets + pasajeros (nested create), asigna asientos únicos por clase
   * - Deduce saldo del usuario
   * - Envía correo a cada pasajero
   * - Elimina items del carrito
   *
   * Asunciones:
   * - checkoutDto es un Record<string, CheckoutItemDto> (item1, item2, ...)
   * - cartService.getCart(userPayload) devuelve objeto con .items (array) y .id_carrito
   * - Se usa now() para comparar fecha_limite
   */
  async processCheckout(userPayload: PayloadInterface, checkoutDto: CheckoutDto) {
    //1. Determinar usuario
    const client: usuario | null = await this.userService.findUserByEmail(userPayload.email);
    if (!client) throw new BadRequestException('Cliente no existente');

    //2. Determinar carrito con items válidos
    const cartItemsList = await this.cartService.getCart(userPayload);
    if (!cartItemsList || !Array.isArray(cartItemsList.items) || cartItemsList.items.length === 0) {
      throw new BadRequestException('Carrito vacío');
    }

    //3. Calcular total a pagar 
    const totalCalc = await this.calculateTotalCart(cartItemsList.items);
    const total = totalCalc.total;

    //4. Saldo del usuario
    const saldo = client.saldo ? client.saldo : 0;

    //5. Validar que el saldo es suficiente
    if (saldo < total) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // 6. Preparar asignación de asientos y creación de tickets/pasajeros
    const now = new Date();

    // Agrupar configuraciones por aeronave para evitar consultas repetidas
    // Pero primero necesitamos para cada vuelo consultar aeronave y configuracion de asientos
    // Pre-cache: map vueloId -> { aeronaveId, configPorClase: { economica: n, primera_clase: m } , tarifa_por_clase }
    const vueloCache = new Map<number, any>();

    // Para evitar colisiones: obtenemos asientos ocupados por tickets pagados (por vuelo y clase)
    // y reservas activas en carrito_item (fecha_limite > now)
    // Pre-calc counts por vuelo/clase
    const ocupadosMap = new Map<string, number>(); // key `${vueloId}_${clase}` -> count

    // Obtener todos los vueloIds desde cartItemsList
    const vueloIds = [...new Set(cartItemsList.items.map(it => it.id_vueloFK))];

    // 6.a Cargar info por vuelo
    for (const vid of vueloIds) {
      const vuelo = await this.prisma.vuelo.findUnique({
        where: { id_vuelo: vid },
        include: {
          aeronave: true,
          aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: { include: { ciudad: true } },
          aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: { include: { ciudad: true } }
        }
      });
      if (!vuelo) throw new BadRequestException(`Vuelo ${vid} no encontrado`);

      // Determinar tipo de vuelo (nacional o internacional)
      const flightType = await this.determineFlightType(vuelo);
      vueloCache.set(vid, { ...vueloCache.get(vid), vuelo, flightType });

      // obtener configuración de asientos para esa aeronave
      const configs = await this.prisma.configuracion_asientos.findMany({
        where: { id_aeronaveFK: vuelo.id_aeronaveFK }
      });
      const configPorClase: Record<string, number> = {};
      for (const c of configs) {
        configPorClase[c.clase] = c.cantidad;
      }

      vueloCache.set(vid, { vuelo, configPorClase });

      // contar tickets pagados existentes por clase
      const cuentas = await this.prisma.ticket.groupBy({
        by: ['asiento_clase'],
        where: { id_vueloFK: vid, estado: 'pagado' },
        _count: { asiento_clase: true }
      });
      for (const c of cuentas) {
        const key = `${vid}_${c.asiento_clase}`;
        ocupadosMap.set(key, (ocupadosMap.get(key) ?? 0) + (c._count.asiento_clase ?? 0));
      }

      // contar reservas activas en carrito_item (fecha_limite > now)
      const reservas = await this.prisma.carrito_item.groupBy({
        by: ['clase'],
        where: {
          id_vueloFK: vid,
          fecha_limite: { gt: now }
        },
        _sum: { cantidad_de_tickets: true }
      });
      for (const r of reservas) {
        const key = `${vid}_${r.clase}`;
        const sumQty = (r._sum.cantidad_de_tickets ?? 0);
        ocupadosMap.set(key, (ocupadosMap.get(key) ?? 0) + sumQty);
      }
    }

    // 6.b Crear operaciones en transacción
    //vamos a darle un type para evitar errores
    const ticketDataList: any[] = []; // <-- acumula solo los objetos data
    const emailNotifications: Array<{ email: string, nombre: string, titulo: string, asiento: string,clase: string }> = [];

    // Para cada item en el checkoutDto (item1, item2, ...), localizar la correspondencia en carrito
    // Si hay mismatch entre cart item qty y DTO CantidadDePasajeros no se bloquea (pero validamos)
    for (const [itemKey, itemDto] of Object.entries(checkoutDto)) {
      const vueloID = itemDto.vueloID;
      const clase = itemDto.Clase as asiento_clases;
      const pasajeros = itemDto.pasajeros ?? [];
      const cantidadEsperada = itemDto.CantidadDePasajeros ?? pasajeros.length;

      if (pasajeros.length !== cantidadEsperada) {
        // permitir que frontend envíe CantidadDePasajeros y la lista, pero si no coinciden, considerar error
        throw new BadRequestException(`Para ${itemKey} la cantidad de pasajeros no coincide con CantidadDePasajeros`);
      }

      // validar que exista item en carrito con ese vuelo y clase y cantidad suficiente
      const carritoMatch = cartItemsList.items.find((ci) => ci.id_vueloFK === vueloID && ci.clase === clase);
      if (!carritoMatch) {
        throw new BadRequestException(`Carrito no contiene el vuelo ${vueloID} en clase ${clase} requerido por ${itemKey}`);
      }
      if (carritoMatch.cantidad_de_tickets < cantidadEsperada) {
        throw new BadRequestException(`Carrito no tiene suficientes tickets para vuelo ${vueloID} (requeridos ${cantidadEsperada})`);
      }

      // obtener config del vuelo
      const cache = vueloCache.get(vueloID);
      if (!cache) throw new BadRequestException(`Información de vuelo ${vueloID} no cargada`);

      // obtener tarifa por unidad
      const tarifa = await this.prisma.tarifa.findFirst({ where: { id_vueloFK: vueloID, clase } });
      if (!tarifa) throw new BadRequestException(`Tarifa no configurada para vuelo ${vueloID} clase ${clase}`);

      // Generar lista de todos los asientos posibles para esta clase
      const flightType = cache.flightType;
      
      // OPTIMIZACIÓN: Pasamos cache.configPorClase como 3er argumento
      const allSeatsForClass = await this.generateAllSeatsForClass(
        flightType,
        clase,
        cache.configPorClase // <--- AQUÍ PASAMOS LA DATA PRE-CARGADA
      );

      // Obtener asientos ya ocupados
      const occupiedSeats = await this.getOccupiedSeats(vueloID, clase);

      // Calcular asientos disponibles (no ocupados)
      const availableSeats = allSeatsForClass.filter(seat => !occupiedSeats.has(seat));

      // Validar que hay suficientes asientos disponibles
      if (availableSeats.length < pasajeros.length) {
        throw new BadRequestException(
          `No hay suficientes asientos disponibles en vuelo ${vueloID} clase ${clase}. ` +
          `Disponibles: ${availableSeats.length}, Solicitados: ${pasajeros.length}`
        );
      }

      // Seleccionar asientos aleatorios para los pasajeros
      let assignedSeats: string[] = [];
      try {
        assignedSeats = this.selectRandomSeats(availableSeats, pasajeros.length);
      } catch (err) {
        throw new BadRequestException(`Error al asignar asientos: ${err?.message ?? err}`);
      }

      // Asignar asientos a pasajeros
      let seatIndex = 0;
      for (const p of pasajeros) {
        const seatNumber = assignedSeats[seatIndex];

        // Crear ticket con pasajero anidado
        const ticketData = {
          id_usuarioFK: client.id_usuario,
          id_vueloFK: vueloID,
          asiento_numero: seatNumber,
          asiento_clase: clase,
          precio: tarifa.precio_base,
          estado: 'pagado' as ticket_estado,
          pasajero: {
            create: {
              nombre: p.nombre,
              apellido: p.apellido,
              dni: p.dni,
              phone: p.phone,
              email: p.email,
              contact_name: p.contact_name ?? null,
              phone_name: p.phone_name ?? null,
              genero: p.genero,
              fecha_nacimiento: new Date(p.fecha_nacimiento)
            }
          }
        };

        // push operation
        ticketDataList.push(ticketData);

        // add to email notifications
        emailNotifications.push({
          email: p.email,
          nombre: `${p.nombre} ${p.apellido}`,
          titulo: (cache.vuelo.noticia?.titulo ?? `Vuelo #${vueloID}`) as string,
          asiento: seatNumber,
          clase
        });

        seatIndex += 1;
      }
    }

    // Ejecutar creación de tickets + pasajeros y deducción de saldo en una transacción
    try {
      await this.prisma.$transaction(async (tx) => {
        // crear tickets (y pasajeros nested) dentro de la transacción usando `tx`
        const creations = ticketDataList.map(td => tx.ticket.create({ data: td }));
        await Promise.all(creations);

        // deducir saldo del usuario dentro de la misma tx
        await tx.usuario.update({
          where: { id_usuario: client.id_usuario },
          data: { saldo: { decrement: total } }
        });

        // (opcional) crear historiales de pago usando `tx` también
      });

      // 7. Enviar correo de confirmación a cada pasajero
      for (const note of emailNotifications) {
        try {
          await this.mailService.sendTicketEmail(note.email, {
            nombre: note.nombre,
            TituloNoticiaVuelo: note.titulo,
            NumeroAsiento: note.asiento,
            CategoriaAsiento: note.clase,
          });
        } catch (err) {
          this.logger.warn(`Error enviando email a ${note.email}: ${err?.message ?? err}`);
          // No lanzamos error crítico por fallo de email; se podría reintentar/queuear en producción
        }
      }

    } catch (err) {
      this.logger.error('Error en transacción de checkout', err);
      throw new BadRequestException('Error al procesar el pago y generar tickets');
    }

    // Vaciar carrito del usuario (elimina todos los items del carrito )
    await this.deleteItemsCart(cartItemsList.id_carrito);

    if (cartItemsList.id_carrito) {
      // Usar PrismaService directamente para vaciar el carrito (por si otro flujo lo dejó)
      const prisma = (this.cartService as any).prisma;
      if (prisma && prisma.carrito_item) {
        try {
          await prisma.carrito_item.deleteMany({ where: { id_carritoFK: cartItemsList.id_carrito } });
        } catch (err) {
          // ya vacío o error no crítico
          this.logger.debug('Intento adicional de vaciado de carrito: ' + (err?.message ?? err));
        }
      }
    }

    return { success: true, message: 'Pago realizado y tickets generados correctamente.' };
  }
}


