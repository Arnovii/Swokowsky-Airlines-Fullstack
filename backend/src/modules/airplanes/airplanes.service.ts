import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';



@Injectable()
export class AirplanesService {
  constructor(private prisma: PrismaService) { }

  /** Lista todas las aeronaves con su configuracion_asientos (economica / primera_clase) */
  async findAllAirplanes() {
    // Traemos la aeronave y su configuracion_asientos
    const aeronaves = await this.prisma.aeronave.findMany({
      include: { configuracion_asientos: true },
      orderBy: { id_aeronave: 'asc' },
    });

    // Mapear a formato simple
    return aeronaves.map(a => {
      // Crear un objeto para almacenar las cantidades por clase
      const config = a.configuracion_asientos.reduce((acc, c) => {
        if (c.clase === 'economica') acc.economica = c.cantidad;
        if (c.clase === 'primera_clase') acc.primera_clase = c.cantidad;
        return acc;
      }, { economica: 0, primera_clase: 0 });

      return {
        id_aeronave: a.id_aeronave,
        modelo: a.modelo,
        capacidad: config.economica + config.primera_clase,
        configuracion_asientos: config,
      };
    });
  }
}
