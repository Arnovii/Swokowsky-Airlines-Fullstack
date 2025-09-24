import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchFlightsDto } from './dto/search-flights.dto';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) {}

  async getAllFlights() {
    return this.prisma.vuelo.findMany();
  }

  filterBasicBar(filters: SearchFlightsDto) {
    return 'This action  a new flight';
  }

}

