import { Controller,Get, Post, Patch, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';

@ApiTags('Carrito')
@ApiBearerAuth('bearerAuth')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @ApiOperation({ summary: 'Obtiene el carrito del usuario autenticado (items activos). Borra items expirados automáticamente.' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async getCart(@ActiveUser() user: PayloadInterface) {
    return this.cartService.getCart(user);
  }


  @Post('items')
  @ApiOperation({ summary: 'Agregar item al carrito (usuario autenticado)' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async addItem(@ActiveUser() user: PayloadInterface, @Body() dto: AddCartItemDto) {
    return this.cartService.addItemToCart(user, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar cantidad de tickets de un item (máx 5)' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async updateItem(@ActiveUser() user: PayloadInterface, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    const itemId = Number(id);
    if (isNaN(itemId)) throw new BadRequestException('ID inválido');
    return this.cartService.updateCartItem(user, itemId, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async deleteItem(@ActiveUser() user: PayloadInterface, @Param('id') id: string) {
    const itemId = Number(id);
    if (isNaN(itemId)) throw new BadRequestException('ID inválido');
    return this.cartService.removeCartItem(user, itemId);
  }
}
