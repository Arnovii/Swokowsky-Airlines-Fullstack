
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { noticia } from '@prisma/client';



@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) { }



  async getAllNews(): Promise<noticia[]> {
    try {
      const noticias: noticia[] = await this.prisma.noticia.findMany();
      return noticias;
    } catch (error) { throw new BadRequestException('Error al obtener noticias'); }
  }

  async getNewByID(id: number) {
    try {
      // Validamos que el id sean caracteres numéricos
      if (isNaN(id)) throw new BadRequestException('El ID debe ser un número');

      // Buscamos la noticia con todos los includes necesarios
      const noticia = await this.prisma.noticia.findUnique({
        where: { id_noticia: id },
        include: {
          vuelo: {
            include: {
              aeronave: {
                include: {
                  configuracion_asientos: true,
                },
              },
              tarifa: true,
              promocion: true,
              // Relaciones a aeropuertos (origen / destino) con ciudad -> pais -> gmt
              aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
                include: {
                  ciudad: {
                    include: {
                      pais: true,
                      gmt: true,
                    },
                  },
                },
              },
              aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
                include: {
                  ciudad: {
                    include: {
                      pais: true,
                      gmt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Si es null, no existe la noticia.
      if (!noticia) throw new NotFoundException(`La noticia #${id} no existe en la base de datos`);

      // Helper para calcular hora local a partir de UTC y offset en horas
      const formatLocal = (utcDate: Date | string | null, offsetHours: number | null) => {
        if (!utcDate || offsetHours === null || offsetHours === undefined) return null;
        const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
        // sumar offset en ms
        const local = new Date(dateObj.getTime() + offsetHours * 60 * 60 * 1000);
        // devolver ISO local (ej. 2025-10-10T08:00:00.000Z) — si prefieres otro formato lo puedes cambiar
        return local.toISOString();
      };

      // Extraemos offsets si existen
      const vuelo = noticia.vuelo;
      let salida_local_origen: string | null = null;
      let llegada_local_destino: string | null = null;

      if (vuelo) {
        const origenCiudadGmt =
          vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.ciudad?.gmt?.offset ?? null;
        const destinoCiudadGmt =
          vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.ciudad?.gmt?.offset ?? null;

        salida_local_origen = formatLocal(vuelo.salida_programada_utc, origenCiudadGmt);
        llegada_local_destino = formatLocal(vuelo.llegada_programada_utc, destinoCiudadGmt);
      }

      // Agregamos campos calculados dentro del objeto vuelo
      const noticiaConLocales = {
        ...noticia,
        vuelo: noticia.vuelo
          ? {
            ...noticia.vuelo,
            salida_local_origen,
            llegada_local_destino,
          }
          : null,
      };

      return noticiaConLocales;
    } catch (err) {
      // Mejor devolvemos InternalServerError para errores inesperados
      throw new InternalServerErrorException(
        `Hubo un problema al obtener la información de la noticia. Por favor, intente nuevamente más tarde. ${err}`,
      );
    }
  }

    /**
   * Retorna la información de una noticia con los datos útiles para el frontend (sin ids ni llaves foráneas)
   */
  async getNewByIDClean(id: number) {
    try {
      if (isNaN(id)) throw new BadRequestException('El ID debe ser un número');
      const noticia = await this.prisma.noticia.findUnique({
        where: { id_noticia: id },
        include: {
          vuelo: {
            include: {
              aeronave: {
                include: {
                  configuracion_asientos: true,
                },
              },
              tarifa: true,
              promocion: true,
              aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
                include: {
                  ciudad: {
                    include: {
                      pais: true,
                      gmt: true,
                    },
                  },
                },
              },
              aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
                include: {
                  ciudad: {
                    include: {
                      pais: true,
                      gmt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!noticia) throw new NotFoundException(`La noticia #${id} no existe en la base de datos`);

      // Helper para calcular hora local a partir de UTC y offset en horas
      const formatLocal = (utcDate: Date | string | null, offsetHours: number | null) => {
        if (!utcDate || offsetHours === null || offsetHours === undefined) return null;
        const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
        const local = new Date(dateObj.getTime() + offsetHours * 60 * 60 * 1000);
        return local.toISOString();
      };

      // Extraemos offsets si existen
      const vuelo = noticia.vuelo;
      let salida_local_origen: string | null = null;
      let llegada_local_destino: string | null = null;
      if (vuelo) {
        const origenCiudadGmt = vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.ciudad?.gmt?.offset ?? null;
        const destinoCiudadGmt = vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.ciudad?.gmt?.offset ?? null;
        salida_local_origen = formatLocal(vuelo.salida_programada_utc, origenCiudadGmt);
        llegada_local_destino = formatLocal(vuelo.llegada_programada_utc, destinoCiudadGmt);
      }

      // Helper para hora en Colombia (GMT-5)
      const toColombiaTime = (utcDate: Date | string | null) => {
        if (!utcDate) return null;
        const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
        const colombia = new Date(dateObj.getTime() + (-5) * 60 * 60 * 1000);
        return colombia.toISOString();
      };

      // Extraer asientos por clase
  let asientos_economica: number | null = null;
  let asientos_primera_clase: number | null = null;
      if (vuelo?.aeronave?.configuracion_asientos) {
        for (const ca of vuelo.aeronave.configuracion_asientos) {
          if (ca.clase === 'economica') asientos_economica = ca.cantidad;
          if (ca.clase === 'primera_clase') asientos_primera_clase = ca.cantidad;
        }
      }

      // Extraer precios por clase
  let precio_economica: number | null = null;
  let precio_primera_clase: number | null = null;
      if (vuelo?.tarifa) {
        for (const t of vuelo.tarifa) {
          if (t.clase === 'economica') precio_economica = t.precio_base;
          if (t.clase === 'primera_clase') precio_primera_clase = t.precio_base;
        }
      }

      // Construimos el objeto limpio para frontend
      const noticiaClean = {
        titulo: noticia.titulo,
        descripcion_corta: noticia.descripcion_corta,
        descripcion_larga: noticia.descripcion_larga,
        url_imagen: noticia.url_imagen,
        modelo_aeronave: vuelo?.aeronave?.modelo ?? null,
        capacidad_aeronave: vuelo?.aeronave?.capacidad ?? null,
        asientos_economica,
        asientos_primera_clase,
        precio_economica,
        precio_primera_clase,
        promocion: vuelo?.promocion
          ? {
              nombre: vuelo.promocion.nombre,
              descripcion: vuelo.promocion.descripcion,
              descuento: vuelo.promocion.descuento,
              fecha_inicio: vuelo.promocion.fecha_inicio,
              fecha_fin: vuelo.promocion.fecha_fin,
            }
          : null,
        estado: vuelo?.estado ?? null,
        salida_programada_utc: vuelo?.salida_programada_utc ?? null,
        llegada_programada_utc: vuelo?.llegada_programada_utc ?? null,
        salida_local_origen,
        llegada_local_destino,
        salida_colombia: toColombiaTime(vuelo?.salida_programada_utc),
        llegada_colombia: toColombiaTime(vuelo?.llegada_programada_utc),
        origen: vuelo?.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto
          ? {
              ciudad: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad?.nombre,
              pais: vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad?.pais?.nombre,
            }
          : null,
        destino: vuelo?.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto
          ? {
              ciudad: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad?.nombre,
              pais: vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad?.pais?.nombre,
            }
          : null,
      };

      return noticiaClean;
    } catch (err) {
      throw new InternalServerErrorException(
        `Hubo un problema al obtener la información de la noticia. Por favor, intente nuevamente más tarde. ${err}`,
      );
    }
  }


}
