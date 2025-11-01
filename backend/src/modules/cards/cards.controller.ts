import { Controller,Get, Post, Patch, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { usuario_tipo_usuario } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';

@ApiTags('Tarjeta - ruta solo para usuarios tipo CLIENTE')
@ApiBearerAuth('bearerAuth')
@Controller('tarjetas')
@Roles(usuario_tipo_usuario.cliente)
@UseGuards(RolesGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) { }

  @Get()
  @ApiOperation({ summary: 'Obtiene la tarjeta del usuario autenticado' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async getCard(@ActiveUser() user: PayloadInterface) {
    return this.cardsService.getCard(user);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Crear una nueva tarjeta (usuario autenticado)' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async create(@ActiveUser() user: PayloadInterface, @Body() createCardDto: CreateCardDto) {
    return this.cardsService.createCard(user, createCardDto);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Eliminar una tarjeta por ID (usuario autenticado)' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async delete(@ActiveUser() user: PayloadInterface, @Param('id') id: string) {
    const cardId = Number(id);
    if (isNaN(cardId)) throw new BadRequestException('ID inválido');
    return this.cardsService.deleteCard(user, cardId);
  }
}
