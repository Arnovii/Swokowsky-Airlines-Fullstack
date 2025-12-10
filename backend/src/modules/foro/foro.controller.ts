import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ForoService } from './foro.service';
import { CreateHiloDto } from './dto/create-hilo.dto';
import { ReplyHiloDto } from './dto/reply-hilo.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Foro')
@ApiBearerAuth('bearerAuth') // Muestra candado en Swagger para todas las rutas
@Controller('foro')
export class ForoController {
  constructor(private readonly foroService: ForoService) {}

  // ✅ PÚBLICO: Ver todos los hilos (para visitantes) - DESHABILITADO
  // Ahora el foro requiere autenticación
  // @Public()
  // @Get('publico')
  // getHilosPublicos() {
  //   return this.foroService.getTodosLosHilos();
  // }

  // Obtener hilos filtrados según el usuario
  // - Admin/Root: ven todos los hilos
  // - Cliente: solo ven sus propios hilos
  @Get('filtrados')
  @ApiOperation({
    summary: 'Obtener hilos del foro filtrados según el usuario.',
    description:
      'Requiere autenticación. Admin/Root ven todos los hilos, clientes solo ven los suyos.',
  })
  getHilosFiltrados(@Req() req) {
    return this.foroService.getHilosFiltrados(req.user.id_usuario);
  }

  // Crear hilo (cliente + admin + root)
  @Post('hilos')
  @ApiOperation({
    summary: 'Crear un nuevo hilo de foro.',
    description:
      'Roles admitidos: cliente, admin, root. El autor se toma del JWT.',
  })
  @ApiBody({
    type: CreateHiloDto,
    description: 'Datos del nuevo hilo (título, contenido, categoría).',
  })
  createHilo(@Body() dto: CreateHiloDto, @Req() req) {
    return this.foroService.crearHilo(dto, req.user.id_usuario);
  }

  // Responder a un hilo
  @Post('hilos/:id_hilo/responder')
  @ApiOperation({
    summary: 'Responder a un hilo existente.',
    description: 'Roles admitidos: cliente, admin, root.',
  })
  @ApiParam({
    name: 'id_hilo',
    description: 'ID del hilo al que se está respondiendo.',
    type: 'integer',
  })
  @ApiBody({
    type: ReplyHiloDto,
    description: 'Contenido de la respuesta.',
  })
  replyHilo(
    @Param('id_hilo') id_hilo: string,
    @Body() dto: ReplyHiloDto,
    @Req() req,
  ) {
    return this.foroService.responderHilo(+id_hilo, dto, req.user.id_usuario);
  }

  // Ver detalle del hilo con respuestas (requiere autenticación)
  // Solo el autor del hilo o admin/root pueden ver el detalle
  @Get('hilos/:id_hilo')
  @ApiOperation({
    summary: 'Obtener el detalle completo de un hilo.',
    description:
      'Requiere autenticación. Solo el autor del hilo o admin/root pueden acceder.',
  })
  @ApiParam({
    name: 'id_hilo',
    description: 'ID del hilo a consultar.',
    type: 'integer',
  })
  getHilo(@Param('id_hilo') id_hilo: string, @Req() req) {
    return this.foroService.getHiloCompletoConPermisos(+id_hilo, req.user.id_usuario);
  }

  // Ver hilos de un usuario
  @Get('mis-hilos')
  @ApiOperation({
    summary: 'Obtener todos los hilos creados por el usuario autentificado.',
    description:
      'La búsqueda se basa en el ID de usuario del token JWT. Roles admitidos: cliente, admin, root.',
  })
  getMyHilos(@Req() req) {
    return this.foroService.getHilosPorUsuario(req.user.id_usuario);
  }

  // Solo ADMIN o ROOT pueden ver todos los hilos
  @UseGuards(RolesGuard)
  @Roles('admin', 'root') // Se añade 'root' aquí ya que tu lógica de servicio lo admite.
  @Get('admin/all')
  @ApiOperation({
    summary: 'ADMIN/ROOT: Obtener todos los hilos del foro.',
    description:
      'Ruta protegida por RolesGuard. Solo usuarios con rol "admin" o "root" pueden acceder. Incluye autores y respuestas.',
  })
  getAll() {
    return this.foroService.getTodosLosHilos();
  }
}

