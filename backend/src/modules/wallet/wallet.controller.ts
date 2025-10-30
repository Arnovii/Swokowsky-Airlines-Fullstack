import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RechargeDto } from './dto/recharge.dto';

@Controller('monedero')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // GET /monedero/1/saldo
  @Get(':idUsuario/saldo')
  getSaldo(@Param('idUsuario') idUsuario: string) {
    return this.walletService.getSaldo(+idUsuario);
  }

  // POST /monedero/recargar
  @Post('recargar')
  recargar(@Body() rechargeDto: RechargeDto) {
    return this.walletService.recargarSaldo(rechargeDto);
  }
}
