import { BadRequestException, Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import * as crypto from 'crypto';
import QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) { }

  private formatDateCO(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }


  /**
   * Genera y guarda código único en el ticket
   */
  async generateAndSaveCode(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id_ticket: ticketId },
      include: { pasajero: true, vuelo: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (!ticket.pasajero) throw new BadRequestException('El ticket no tiene pasajero asociado');

    const base = `${ticket.pasajero.dni}-${ticket.id_vueloFK}-${ticket.id_ticket}-${Date.now()}`;
    const code = crypto.createHash('sha256').update(base).digest('hex').slice(0, 12);

    await this.prisma.ticket.update({
      where: { id_ticket: ticketId },
      data: {
        uniqueCheckinCode: code,
        // no activamos checkinEnabled aquí; la validación comprueba ventana 24h
      },
    });

    return { codigo: code };
  }

  /**
   * Valida código de reserva + dni para encontrar el ticket específico del pasajero
   * Ahora el código es compartido por todos los tickets de una transacción,
   * por lo que usamos código + DNI para identificar al pasajero específico
   */
async validateCode(codigo_unico: string, dni: string) {
  this.logger.log(`🔍 Validando check-in - Código de reserva: ${codigo_unico}, DNI: ${dni}`);
  
  // Buscar el ticket que coincida con el código Y cuyo pasajero tenga ese DNI
  const ticket = await this.prisma.ticket.findFirst({
    where: { 
      uniqueCheckinCode: codigo_unico.toUpperCase(), // Código en mayúsculas
      pasajero: {
        dni: dni
      }
    },
    include: { 
      pasajero: true, 
      vuelo: {
        include: {
          aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
            include: {
              ciudad: true
            }
          },
          aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
            include: {
              ciudad: true
            }
          }
        }
      }
    },
  });

  this.logger.log(`🔍 Ticket encontrado: ${ticket ? `ID ${ticket.id_ticket}` : 'NO ENCONTRADO'}`);
  
  if (!ticket) {
    // Verificar si el código existe pero el DNI no coincide
    const ticketWithCode = await this.prisma.ticket.findFirst({
      where: { uniqueCheckinCode: codigo_unico.toUpperCase() },
      include: { pasajero: true }
    });
    
    if (ticketWithCode) {
      this.logger.log(`🔍 El código existe pero el DNI no coincide`);
      throw new BadRequestException('El DNI no coincide con ningún pasajero de esta reserva');
    }
    
    throw new NotFoundException('Código de reserva inválido');
  }
  
  if (!ticket.pasajero) throw new BadRequestException('Ticket sin pasajero asociado');
  
  this.logger.log(`🔍 Pasajero encontrado: ${ticket.pasajero.nombre} ${ticket.pasajero.apellido}`);

  const now = new Date();
  const salida = new Date(ticket.vuelo.salida_programada_utc);
  const diffHours = (salida.getTime() - now.getTime()) / (1000 * 60 * 60);

  this.logger.log(`⏰ Hora actual (servidor): ${now.toISOString()}`);
  this.logger.log(`✈️ Hora de salida del vuelo: ${salida.toISOString()}`);
  this.logger.log(`⏱️ Diferencia en horas: ${diffHours.toFixed(2)}`);

  // Permitir check-in si el vuelo está dentro de las próximas 24 horas
  if (diffHours > 24) {
    this.logger.log(`❌ Check-in rechazado: faltan más de 24 horas para el vuelo`);
    throw new BadRequestException(`El check-in solo está disponible dentro de las 24 horas antes del vuelo. Faltan ${diffHours.toFixed(1)} horas.`);
  }

  if (ticket.checkinCompleted) throw new BadRequestException('El check-in ya fue confirmado para este ticket');

  // Retornar datos útiles para frontend
  return {
    ticketId: ticket.id_ticket,
    id_vuelo: ticket.id_vueloFK,
    pasajero: {
      nombre: `${ticket.pasajero.nombre} ${ticket.pasajero.apellido}`,
      dni: ticket.pasajero.dni,
      email: ticket.pasajero.email,
    },
    asientoComprado: ticket.asiento_numero,
    asientoAsignado: ticket.asientoAsignado ?? null,
    salida: ticket.vuelo.salida_programada_utc,
    clase: ticket.asiento_clase, // 'primera_clase' o 'economica'
    ciudadOrigen: ticket.vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.nombre,
    ciudadDestino: ticket.vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.nombre,
  };
}

  /**
   * Genera todos los asientos para una clase específica usando el mismo
   * algoritmo que checkout.service.ts (formato A1, B2, D14, etc.)
   */
  private generateAllSeatsForClass(
    mapaAsientos: Record<string, number>,
    claseTarget: 'primera_clase' | 'economica'
  ): string[] {
    const seats: string[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const totalColumns = columns.length;

    if (mapaAsientos[claseTarget] === undefined) {
      return seats;
    }

    // Calcular dinámicamente el inicio
    let firstRow = 1;
    let firstColumnIndex = 0;

    if (claseTarget === 'economica') {
      const asientosPrevios = mapaAsientos['primera_clase'] || 0;
      firstRow = Math.floor(asientosPrevios / totalColumns) + 1;
      firstColumnIndex = asientosPrevios % totalColumns;
    }

    // Generar asientos
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

  /**
   * Construye el mapa completo de asientos para un vuelo a partir de:
   * - configuracion_asientos de la aeronave (cantidad por clase)
   * - tickets existentes (asiento_numero y asientoAsignado)
   *
   * Devuelve { '<codigo>': 'Disponible' | 'Ocupado (vendido)' | 'Ocupado (asignado)' }
   * Formato de asiento: A1, B2, D14, etc. (igual que checkout)
   */
  async getSeatsForFlight(id_vuelo: number) {
    // 1) obtener vuelo y su aeronave y configuracion_asientos
    const vuelo = await this.prisma.vuelo.findUnique({
      where: { id_vuelo },
      include: { aeronave: { include: { configuracion_asientos: true } } },
    });
    if (!vuelo) throw new NotFoundException('Vuelo no encontrado');

    // 2) Crear mapa de configuración
    const configs = vuelo.aeronave.configuracion_asientos;
    const mapaAsientos: Record<string, number> = {};
    configs.forEach((cfg) => {
      mapaAsientos[cfg.clase] = cfg.cantidad;
    });

    // 3) Generar códigos de asientos usando el mismo algoritmo que checkout
    const seatCodes: string[] = [
      ...this.generateAllSeatsForClass(mapaAsientos, 'primera_clase'),
      ...this.generateAllSeatsForClass(mapaAsientos, 'economica'),
    ];

    // 4) obtener tickets del vuelo para conocer asientos vendidos/asignados
    const tickets = await this.prisma.ticket.findMany({
      where: { id_vueloFK: id_vuelo },
      select: { asiento_numero: true, asientoAsignado: true, estado: true },
    });

    const map: Record<string, string> = {};
    seatCodes.forEach((code) => (map[code] = 'Disponible'));

    for (const t of tickets) {
      if (t.asiento_numero) {
        map[t.asiento_numero] = 'Ocupado (vendido)';
      }
      if (t.asientoAsignado) {
        // si ya marcado como vendido lo mantenemos, sino marcamos como asignado
        if (map[t.asientoAsignado] === 'Disponible') {
          map[t.asientoAsignado] = 'Ocupado (asignado)';
        } else {
          // deja el valor (vendido tiene prioridad)
        }
      }
    }

    return map;
  }

  /**
   * Asignar asiento al ticket usando el código de reserva y ticketId.
   * Verifica:
   * - ticket válido y pertenece a esa reserva
   * - ventana <=24h
   * - asiento existe en la configuración del avión
   * - asiento no esté ocupado por otro ticket (vendido o asignado)
   * - asiento sea de la clase correspondiente al ticket
   */
  async assignSeat(codigo_unico: string, ticketId: number, asientoCodigo: string) {
    // Buscar el ticket específico que coincida con el código de reserva Y el ticketId
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id_ticket: ticketId,
        uniqueCheckinCode: codigo_unico.toUpperCase()
      },
      include: {
        vuelo: {
          include: {
            aeronave: { include: { configuracion_asientos: true } }
          }
        },
        pasajero: true
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado o código de reserva inválido');
    if (!ticket.pasajero) throw new BadRequestException('Ticket sin pasajero');

    const now = new Date();
    const salida = new Date(ticket.vuelo.salida_programada_utc);
    const diffHours = (salida.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) throw new BadRequestException('El asiento solo se puede seleccionar dentro de las 24 horas antes del vuelo');

    // Reusar getSeatsForFlight para validar existencia y estado
    const seatMap = await this.getSeatsForFlight(ticket.id_vueloFK);
    if (!seatMap.hasOwnProperty(asientoCodigo)) {
      throw new NotFoundException('El asiento no existe para este vuelo');
    }

    const estado = seatMap[asientoCodigo];

    // ✅ Permitir re-asignar el mismo asiento que ya tiene este ticket
    const asientoEsDelMismoTicket =
      ticket.asientoAsignado === asientoCodigo ||
      ticket.asiento_numero === asientoCodigo;

    if (estado !== 'Disponible' && !asientoEsDelMismoTicket) {
      throw new ConflictException('El asiento está ocupado');
    }

    // ✅ VALIDAR QUE EL ASIENTO SEA DE LA CLASE CORRECTA
    const configs = ticket.vuelo.aeronave.configuracion_asientos;
    const mapaAsientos: Record<string, number> = {};
    configs.forEach((cfg) => {
      mapaAsientos[cfg.clase] = cfg.cantidad;
    });

    // Generar asientos de primera clase para saber cuáles son
    const primeraClaseSeats = this.generateAllSeatsForClass(mapaAsientos, 'primera_clase');
    const esPrimeraClase = primeraClaseSeats.includes(asientoCodigo);

    // Verificar que la clase del asiento coincida con la clase del ticket
    const claseTicket = ticket.asiento_clase; // 'primera_clase' o 'economica'
    const asientoEsPrimera = esPrimeraClase;
    const ticketEsPrimera = claseTicket === 'primera_clase';

    this.logger.log(`🎫 Ticket clase: ${claseTicket}, Asiento ${asientoCodigo} es primera clase: ${asientoEsPrimera}`);

    if (ticketEsPrimera && !asientoEsPrimera) {
      throw new BadRequestException('Tu ticket es de Primera Clase. Solo puedes seleccionar asientos de Primera Clase.');
    }
    if (!ticketEsPrimera && asientoEsPrimera) {
      throw new BadRequestException('Tu ticket es de Clase Económica. Solo puedes seleccionar asientos de Clase Económica.');
    }

    // Actualizar ticket.asientoAsignado (no confirmamos check-in aun)
    const updated = await this.prisma.ticket.update({
      where: { id_ticket: ticket.id_ticket },
      data: { asientoAsignado: asientoCodigo },
    });

    return {
      message: 'Asiento asignado correctamente',
      asientoAsignado: updated.asientoAsignado,
    };
  }

  /**
   * Confirmar check-in: marcar checkinCompleted, setear fecha
   * NO borra el código de reserva porque otros pasajeros de la misma transacción lo necesitan
   */
  async confirmCheckin(codigo_unico: string, ticketId: number) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id_ticket: ticketId,
        uniqueCheckinCode: codigo_unico.toUpperCase()
      },
      include: {
        pasajero: true,
        vuelo: {
          include: {
            aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
              include: { ciudad: true }
            },
            aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
              include: { ciudad: true }
            },
          }
        }
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado o código de reserva inválido');

    if (!ticket.asientoAsignado) throw new BadRequestException('Debe seleccionar un asiento antes de confirmar el check-in');

    if (ticket.checkinCompleted) throw new BadRequestException('El check-in ya fue confirmado');

    const updated = await this.prisma.ticket.update({
      where: { id_ticket: ticket.id_ticket },
      data: {
        checkinCompleted: true,
        checkinCompletedAt: new Date(),
        checkinEnabled: false,
        // NO borramos uniqueCheckinCode porque otros pasajeros de la misma reserva lo necesitan
      },
    });

    // Extraer información del vuelo
    const origen = ticket.vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto;
    const destino = ticket.vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto;

    // construir boardingPassUrl (igual que antes)
    let envFront = this.configService.get<string>('FRONTEND_QR_CODE_URL') || '';
    const frontend = envFront.replace(/\/$/, '');
    console.log('🌐 FRONTEND URL:', frontend);
    const params = new URLSearchParams({
      ticketId: String(updated.id_ticket),
      pasajero: `${ticket.pasajero!.nombre} ${ticket.pasajero!.apellido}`.trim(),
      dni: ticket.pasajero!.dni,
      asiento: updated.asientoAsignado ?? '',
      vuelo: String(ticket.vuelo.id_vuelo),
      origen: origen.codigo_iata ?? '',
      destino: destino.codigo_iata ?? '',
      salida: ticket.vuelo.salida_programada_utc.toISOString(),
    });
    const boardingPassUrl = `${frontend}/checkin/boarding-pass?${params.toString()}`;
    console.log('🔗 Boarding Pass URL:', boardingPassUrl);

    // generar QR buffer
    const qrBuffer = await QRCode.toBuffer(boardingPassUrl, {
      type: 'png',
      width: 600,
      margin: 1,
    });

    // preparar attachment inline con CID
    const attachments = [
      {
        filename: 'boarding-pass-qr.png',
        content: qrBuffer,
        cid: 'boardingpass_qr@swokowsky', // debe coincidir con la plantilla
        contentType: 'image/png',
      },
    ];

    // formatear fechas en hora Colombia (usa tu helper)
    const departureCO = this.formatDateCO(ticket.vuelo.salida_programada_utc);
    const arrivalCO = this.formatDateCO(ticket.vuelo.llegada_programada_utc);

    // enviar correo con attachment inline
    await this.mailService.sendCheckinConfirmationEmail(
      ticket.pasajero!.email,
      {
        clientName: `${ticket.pasajero!.nombre} ${ticket.pasajero!.apellido}`.trim(),
        origin: `${origen.ciudad.nombre} (${origen.codigo_iata})`,
        destination: `${destino.ciudad.nombre} (${destino.codigo_iata})`,
        departureDate: departureCO,
        arrivalDate: arrivalCO,
        seatNumber: updated.asientoAsignado ?? '',
        boardingPassUrl,
      },
      attachments,
    );



    return {
      message: 'Check-in confirmado con éxito',
      ticketId: updated.id_ticket,
      asiento: updated.asientoAsignado,
      pasajero: ticket.pasajero ? {
        nombre: ticket.pasajero.nombre,
        dni: ticket.pasajero.dni,
      } : null,
      vuelo: {
        id: ticket.vuelo.id_vuelo,
        origen: {
          aeropuerto: origen.nombre,
          codigo: origen.codigo_iata,
          ciudad: origen.ciudad.nombre,
        },
        destino: {
          aeropuerto: destino.nombre,
          codigo: destino.codigo_iata,
          ciudad: destino.ciudad.nombre,
        },
        salida: ticket.vuelo.salida_programada_utc,
        llegada: ticket.vuelo.llegada_programada_utc,
      },
      codigoReserva: ticket.uniqueCheckinCode,
    };
  }
}
