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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { usuario_tipo_usuario } from '@prisma/client';
import { UseGuards } from '@nestjs/common';



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
}
