import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversacionDto } from './dto/create-conversacion.dto';
import { SendMensajeDto } from './dto/send-mensaje.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Chat Privado')
@ApiBearerAuth('bearerAuth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ==================== CLIENTE ====================

  // Crear nueva conversación (cualquier usuario autenticado)
  @Post('conversaciones')
  @ApiOperation({
    summary: 'Crear una nueva conversación de soporte',
    description: 'El usuario crea una conversación con un mensaje inicial.',
  })
  @ApiBody({ type: CreateConversacionDto })
  crearConversacion(@Body() dto: CreateConversacionDto, @Req() req) {
    return this.chatService.crearConversacion(dto, req.user.id_usuario);
  }

  // Obtener mis conversaciones (usuario autenticado)
  @Get('mis-conversaciones')
  @ApiOperation({
    summary: 'Obtener mis conversaciones',
    description: 'Lista las conversaciones del usuario autenticado.',
  })
  getMisConversaciones(@Req() req) {
    return this.chatService.getMisConversaciones(req.user.id_usuario);
  }

  // Ver detalle de una conversación
  @Get('conversaciones/:id')
  @ApiOperation({
    summary: 'Ver detalle de una conversación',
    description:
      'Obtiene todos los mensajes de una conversación. Solo el dueño o admin/root pueden verla.',
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación', type: 'number' })
  getConversacion(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.chatService.getConversacion(id, req.user.id_usuario);
  }

  // Enviar mensaje a una conversación
  @Post('conversaciones/:id/mensajes')
  @ApiOperation({
    summary: 'Enviar mensaje a una conversación',
    description:
      'El dueño de la conversación o admin/root pueden enviar mensajes.',
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación', type: 'number' })
  @ApiBody({ type: SendMensajeDto })
  enviarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendMensajeDto,
    @Req() req,
  ) {
    return this.chatService.enviarMensaje(id, dto, req.user.id_usuario);
  }

  // ==================== ADMIN ====================

  // Obtener todas las conversaciones (solo admin/root)
  @Get('admin/conversaciones')
  @Roles('admin', 'root')
  @ApiOperation({
    summary: 'Obtener todas las conversaciones (Admin)',
    description: 'Lista todas las conversaciones de todos los usuarios.',
  })
  getTodasLasConversaciones() {
    return this.chatService.getTodasLasConversaciones();
  }

  // Cerrar conversación (solo admin/root)
  @Patch('conversaciones/:id/cerrar')
  @Roles('admin', 'root')
  @ApiOperation({
    summary: 'Cerrar una conversación (Admin)',
    description: 'Marca la conversación como cerrada. No se podrán enviar más mensajes.',
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación', type: 'number' })
  cerrarConversacion(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.cerrarConversacion(id);
  }

  // Reabrir conversación (solo admin/root)
  @Patch('conversaciones/:id/reabrir')
  @Roles('admin', 'root')
  @ApiOperation({
    summary: 'Reabrir una conversación (Admin)',
    description: 'Reabre una conversación cerrada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la conversación', type: 'number' })
  reabrirConversacion(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.reabrirConversacion(id);
  }
}
