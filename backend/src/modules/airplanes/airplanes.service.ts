import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';



@Injectable()
export class AirplanesService {
  constructor(private prisma: PrismaService) { }

  /** Lista todas las aeronaves con su configuracion_asientos (economica / primera_clase) */
  async findAll() {
    // Traemos la aeronave y su configuracion_asientos
    const aeronaves = await this.prisma.aeronave.findMany({
      include: { configuracion_asientos: true },
      orderBy: { id_aeronave: 'asc' },
    });

    // Mapear a formato simple
    return aeronaves.map(a => {
      const conf = a.configuracion_asientos || [];
      const economica = conf.find(c => c.clase === 'economica')?.cantidad ?? null;
      const primera = conf.find(c => c.clase === 'primera_clase')?.cantidad ?? null;
      return {
        id_aeronave: a.id_aeronave,
        modelo: a.modelo,
        capacidad: a.capacidad,
        configuracion_asientos: {
          economica,
          primera_clase: primera,
        }
      };
    });
  }
}
