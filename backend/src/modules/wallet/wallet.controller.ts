import { Controller, Get} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiHeader } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator'
import { usuario_tipo_usuario } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { WalletService } from './wallet.service';



@ApiTags('Monedero - ruta solo para usuarios tipo CLIENTE')
@ApiBearerAuth('bearerAuth')
@Controller('monedero')
@Roles(usuario_tipo_usuario.cliente)
@UseGuards(RolesGuard)
export class WalletController {
  constructor(private readonly WalletService: WalletService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener el estado del monedero del usuario autenticado' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  async getWallet(@ActiveUser() user: PayloadInterface) {
    return this.WalletService.getSaldo(user);
  }
}

