import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { asiento_clases } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiBearerAuth('bearerAuth')
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  /**
   * 🔹 Crear un nuevo ticket (por defecto en estado 'Pagado')
   * Ejemplo JSON de entrada:
   * {
   *   "idUsuario": 1,
   *   "idVuelo": 10,
   *   "clase": "Economica",
   *   "precio": 500.0
   * }
   */

  @Post()
  async createTicket(@Body() body: any) {
    const { idUsuario, idVuelo, clase, precio } = body;

    if (!idUsuario || !idVuelo || !clase || !precio) {
      throw new BadRequestException(
        'Faltan datos obligatorios: idUsuario, idVuelo, clase o precio',
      );
    }

    // Normalizar el valor de clase para aceptar diferentes formatos
    let claseNormalizada: asiento_clases;
    const claseLower = String(clase).toLowerCase();
    if (claseLower === 'economica') {
      claseNormalizada = asiento_clases.economica;
    } else if (claseLower === 'primeraclase' || claseLower === 'primera_clase') {
      claseNormalizada = asiento_clases.primera_clase;
    } else {
      throw new BadRequestException('La clase debe ser "Economica"/"economica" o "PrimeraClase"/"primera_clase"');
    }
    return this.ticketService.createTicket(
      Number(idUsuario),
      Number(idVuelo),
      claseNormalizada,
      Number(precio),
    );
  }

  /**
   * 🔹 Obtener todos los tickets pagados de un usuario
   */
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @Get(':idUsuario')
  async getTicketsByUser(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.ticketService.getTicketsByUser(idUsuario);
  }
}
