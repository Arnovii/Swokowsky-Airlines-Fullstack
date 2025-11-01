import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, BadRequestException,ForbiddenException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator'
import { usuario_tipo_usuario } from '@prisma/client';
import {CheckoutItemDto} from './dto/checkout.dto'


@Controller('checkout')
@ApiTags('checkout - Ruta solo para usuarios tipo CLIENTE')
@ApiBearerAuth('bearerAuth')
@Roles(usuario_tipo_usuario.cliente)
@UseGuards(RolesGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Realiza el checkout creando tickets y pasajeros (nested writes).' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async createCheckout(@ActiveUser() user: PayloadInterface, @Body() body: Record<string, CheckoutItemDto>) {
    if (!user || !user.id_usuario) {
      throw new BadRequestException('Usuario inválido');
    }
    return this.checkoutService.processCheckout(user, body);
  }
}
