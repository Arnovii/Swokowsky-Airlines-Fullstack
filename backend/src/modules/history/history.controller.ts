import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('Historial') // Etiqueta para agrupar en Swagger
@ApiBearerAuth('bearerAuth') // Muestra el candado de autenticación
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener el historial de actividades del usuario autentificado.',
    description:
      'Requiere un Bearer Token. El ID del usuario ',
  })
  async getHistory(@Req() req) {
    const userId = Number(req.user.id_usuario);
    return this.historyService.getUserHistory(userId);
  }
}