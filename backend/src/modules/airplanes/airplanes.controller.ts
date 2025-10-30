import { Controller, Get, UseGuards } from '@nestjs/common';
import { AirplanesService } from './airplanes.service';
import { Roles } from '../../common/decorators/roles.decorator'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('airplanes')
@ApiBearerAuth('bearerAuth') // muestra candado en swagger y asocia el esquema 'bearerAuth'
@ApiTags('Airplanes - Ruta solo para administradores')
@Roles('admin')
@UseGuards(RolesGuard)
export class AirplanesController {
  constructor(private readonly airplanesService: AirplanesService) { }


  @Get()
  @ApiOperation({ summary: 'Listar aeronaves con configuración de asientos' })
  findAll() {
    return this.airplanesService.findAllAirplanes();
  }

}
