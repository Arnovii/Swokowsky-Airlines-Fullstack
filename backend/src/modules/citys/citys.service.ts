import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ciudad } from '@prisma/client';


@Injectable()
export class CitysService {
  constructor(private readonly prisma: PrismaService) { }


  getAllCities() {
    return this.prisma.ciudad.findMany();
  }
}
