import { Controller, Get } from '@nestjs/common';
import { CitysService } from './citys.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Ciudades')
@Public()
@Controller('citys')
export class CitysController {
  constructor(private readonly citysService: CitysService) { }


  @Get()
  @ApiOperation({ summary: 'Obtener lista de todas las ciudades, con su ID y con su código' })

  findAll() {
    return this.citysService.getAllCities();
  }


}
