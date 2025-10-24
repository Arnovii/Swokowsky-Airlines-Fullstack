import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AirportsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const aeropuertos = await this.prisma.aeropuerto.findMany({
      include: {
        ciudad: {
          include: {
            pais: true
          }
        }
      },
      orderBy: { id_aeropuerto: 'asc' },
    });

    return aeropuertos.map(a => ({
      id_aeropuerto: a.id_aeropuerto,
      nombre: a.nombre,
      codigo_iata: a.codigo_iata,
      ciudad: {
        id_ciudad: a.ciudad?.id_ciudad ?? null,
        nombre: a.ciudad?.nombre ?? null
      },
      pais: {
        id_pais: a.ciudad?.pais?.id_pais ?? null,
        nombre: a.ciudad?.pais?.nombre ?? null
      }
    }));
  }


}
