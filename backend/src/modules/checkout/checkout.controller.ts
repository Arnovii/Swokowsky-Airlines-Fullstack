import { Controller, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiBearerAuth('bearerAuth')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @Post()
  async processCheckout(@Body() checkoutDto: CheckoutDto, @Req() req: any) {
    // El saldo se obtiene del token (req.user)
    const user = req.user;
    if (!user) throw new BadRequestException('Usuario no autenticado');
    return this.checkoutService.processCheckout(user, checkoutDto);
  }
}
