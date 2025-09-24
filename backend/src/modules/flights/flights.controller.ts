import { Controller, Get, Post, Body} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation} from '@nestjs/swagger';


@ApiTags('Vuelos')
@Controller('flights')
@Public()
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) { }

  @Post()
  @ApiOperation({ summary: 'Obtener lista de todos los vuelos con base a los filtros enviados en el body' })
  filterBasic(@Body() filters: SearchFlightsDto) {
    return this.flightsService.filterBasicBar(filters);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los vuelos' })
  getAll() {
    return this.flightsService.getAllFlights();
  }


}

