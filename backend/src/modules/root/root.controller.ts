import { Controller, Post, Body, UseGuards, Get, Delete } from '@nestjs/common';
import { RootService } from './root.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator'
import { CreateAdminDto } from './dto/create-admin.dto';
import { usuario_tipo_usuario } from '@prisma/client';
import { DeleteAdminDto } from './dto/detele-admin.dto';


@Controller('root')
@ApiBearerAuth('bearerAuth') // muestra candado en swagger y asocia el esquema 'bearerAuth'
@ApiTags('Root - Ruta solo para usuarios tipo ROOT')
@Roles(usuario_tipo_usuario.root)
@UseGuards(RolesGuard)
export class RootController {
  constructor(private readonly rootService: RootService) { }

  @Post('/admin')
  @ApiOperation({ summary: 'Crear un usuario tipo admin' })
  createAdmin(
    @Body() createAdminDto: CreateAdminDto) {
    return this.rootService.createAdmin(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener listado de usuarios tipo admin' })
  getAllAdmins(){
    return this.rootService.getAllAdmins();
  }

  @Delete('admin')
  async deleteAdmin(@Body() deleteAdminDto: DeleteAdminDto) {
    return this.rootService.deleteAdmin(deleteAdminDto)
  }


}
