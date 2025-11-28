import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateFlightDto } from './dto/update-flight.dto';




@ApiTags('Vuelos')
@Controller('flights')
@Public()
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) { }

  @Post('search')
  @ApiOperation({ summary: 'Obtener lista de todos los vuelos con base a los filtros enviados en el body' })
  async filterBasic(@Body() filters: SearchFlightsDto) {
    try {
      // try {
      // const result = await this.flightsService.searchFlights(filters);
      const result = await this.flightsService.searchFlightsClean(filters);
      return result;
    } catch (err) {
      throw err;      // Re-lanzar la excepción para que Nest la transforme correctamente

    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los vuelos' })
  getAll() {
    return this.flightsService.getAllFlights();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo vuelos activos (no cancelados)' })
  getActiveFlights() {
    return this.flightsService.getActiveFlights();
  }

  @Patch(':id')
  updateFlight(
    @Param('id', ParseIntPipe) id_vuelo: number,
    @Body() dto: UpdateFlightDto,
  ) {
    return this.flightsService.updateFlight(id_vuelo, dto);
  }

}

