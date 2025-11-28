import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
  Patch
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { usuario_tipo_usuario } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';




@ApiTags('tickets - ruta solo para usuarios tipo CLIENTE')
@ApiBearerAuth('bearerAuth')
@Roles(usuario_tipo_usuario.cliente)
@UseGuards(RolesGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get()
  @ApiOperation({ summary: 'Obtiene la tarjeta del usuario autenticado' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async getCard(@ActiveUser() user: PayloadInterface) {
    return this.ticketService.getTicketsByUser(user.id_usuario);
  }

  @Patch(':id_ticket')
  @ApiOperation({ summary: 'Actualizar el estado de un ticket (requiere 1 hora antes del vuelo)' })
  async updateEstadoTicket(
    @Param('id_ticket', ParseIntPipe) id_ticket: number,
    @ActiveUser() user: PayloadInterface,
    @Body() dto: UpdateTicketStatusDto
  ) {
    return this.ticketService.updateTicketStatus(
      id_ticket,
      user.id_usuario,
      dto.estado
    );
  }

}
