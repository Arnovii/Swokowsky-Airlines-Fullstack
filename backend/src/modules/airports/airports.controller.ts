import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AirportsService } from './airports.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';


@ApiTags('Aeropuertos')
@Public()
@Controller('airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}
  
  
  @ApiOperation({ summary: 'Listar aeropuertos' })
  @Get()
  findAll() {
    return this.airportsService.findAll();
  }

}
