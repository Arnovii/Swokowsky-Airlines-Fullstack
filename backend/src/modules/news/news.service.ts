
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { noticia } from '@prisma/client';
import { CreateNewsDto } from './dto/create-news.dto';
import { DateTime } from 'luxon';
import { promocion as PromocionModel } from '@prisma/client';


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

      /*---- CALCULAR HORA DE LLEGADA LOCAL*/

      const formatLocal = (utcDate: Date | string | null, offsetHours: number | null) => {
        if (!utcDate || offsetHours === null || offsetHours === undefined) return null;
        const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
        const local = new Date(dateObj.getTime() + offsetHours * 60 * 60 * 1000);
        return local.toISOString();
      };
      // Helper para calcular hora local a partir de UTC y offset en horas
      const vuelo = noticia.vuelo;
      const ciudadOrigen = vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.nombre
      const ciudadDestino = vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.nombre
      console.log(`Voy de ${ciudadOrigen}`)
      console.log(`Hacia ${ciudadDestino}`)
      //Extraemos offset para poder calcular hora local del destino
      const origenCiudadGmt = vuelo.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.gmt.offset
      const destinoCiudadGmt = vuelo.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.gmt.offset

      let hora_salida_local_ciudad_destino = formatLocal(vuelo.salida_programada_utc, destinoCiudadGmt);
      let hora_llegada_local_ciudad_destino = formatLocal(vuelo.llegada_programada_utc, destinoCiudadGmt);
      //Si existe diferencia horaria entre el local y el destino
      



      console.log("Horas UTC")
      console.log(vuelo.salida_programada_utc)
      console.log(vuelo.llegada_programada_utc)
      console.log("==========")

      console.log("Horas LOCAL")
      console.log(hora_salida_local_ciudad_destino)
      console.log(hora_llegada_local_ciudad_destino)
      console.log("==========")


      /*CALCULAR HORA DE LLEGADA LOCAL*/

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
        hora_salida_local_ciudad_destino,
        hora_llegada_local_ciudad_destino,
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

  async createNew(dto: CreateNewsDto) {
    const {
      titulo,
      descripcion_corta,
      descripcion_larga,
      url_imagen,
      precio_economica,
      precio_primera_clase,
      promocion,
      salida_colombia,
      llegada_colombia,
      id_aeronaveFK,
      id_aeropuerto_origenFK,
      id_aeropuerto_destinoFK,
    } = dto;

    // 1) Validar entidades referenciadas existentes
    const [aeropuertoOrigen, aeropuertoDestino, aeronave] = await Promise.all([
      this.prisma.aeropuerto.findUnique({ where: { id_aeropuerto: id_aeropuerto_origenFK }, include: { ciudad: { include: { pais: true, gmt: true } } } }),
      this.prisma.aeropuerto.findUnique({ where: { id_aeropuerto: id_aeropuerto_destinoFK }, include: { ciudad: { include: { pais: true, gmt: true } } } }),
      this.prisma.aeronave.findUnique({ where: { id_aeronave: id_aeronaveFK } }),
    ]);

    if (!aeropuertoOrigen) throw new BadRequestException('Aeropuerto de origen no encontrado');
    if (!aeropuertoDestino) throw new BadRequestException('Aeropuerto de destino no encontrado');
    if (!aeronave) throw new BadRequestException('Aeronave no encontrada');

    // 1b) Obtener configuracion_asientos de la aeronave (obligatoria)
    const configAsientos = await this.prisma.configuracion_asientos.findMany({
      where: { id_aeronaveFK }
    });
    // Esperamos tener al menos economica y/o primera_clase configuradas
    const confEconomica = configAsientos.find(c => c.clase === 'economica');
    const confPrimera = configAsientos.find(c => c.clase === 'primera_clase');

    if (!confEconomica && !confPrimera) {
      throw new BadRequestException('La aeronave no tiene configuración de asientos (economica/primera_clase).');
    }

    // 2) Parsear y validar las fechas/hora que envió el admin — son en zona America/Bogota
    const depBog = DateTime.fromISO(salida_colombia, { zone: 'America/Bogota' });
    const arrBog = DateTime.fromISO(llegada_colombia, { zone: 'America/Bogota' });
    if (!depBog.isValid || !arrBog.isValid) throw new BadRequestException('Fechas/hora inválidas (deben ser ISO 8601).');
    if (arrBog <= depBog) throw new BadRequestException('La llegada debe ser posterior a la salida.');

    const departureUTCDate = depBog.toUTC().toJSDate();
    const arrivalUTCDate = arrBog.toUTC().toJSDate();

    // Zonas locales (preferimos zoneName si existe en gmt, sino usamos offset)
    const originGmt = aeropuertoOrigen.ciudad?.gmt;
    const destGmt = aeropuertoDestino.ciudad?.gmt;

    const originZone = originGmt?.name ?? (originGmt ? `UTC${originGmt.offset >= 0 ? '+' + originGmt.offset : originGmt.offset}` : 'UTC');
    const destZone = destGmt?.name ?? (destGmt ? `UTC${destGmt.offset >= 0 ? '+' + destGmt.offset : destGmt.offset}` : 'UTC');

    const departureLocalOrigin = DateTime.fromJSDate(departureUTCDate).setZone(originZone);
    const arrivalLocalDest = DateTime.fromJSDate(arrivalUTCDate).setZone(destZone);

    // 3) Validar promoción opcional: si viene, crearla (y luego asignar id_promocionFK al vuelo)
    // Validaciones básicas de la promo
    let promocionCreada: PromocionModel | null = null;  // Define el tipo claramente
    if (promocion) {
      // Validar rango de fechas
      const fIni = DateTime.fromISO(promocion.fecha_inicio);
      const fFin = DateTime.fromISO(promocion.fecha_fin);
      if (!fIni.isValid || !fFin.isValid) throw new BadRequestException('Fechas de promoción inválidas');
      if (fFin <= fIni) throw new BadRequestException('fecha_fin debe ser posterior a fecha_inicio en la promoción');

      // Crear promoción
      promocionCreada = await this.prisma.promocion.create({
        data: {
          nombre: promocion.nombre,
          descripcion: promocion.descripcion,
          descuento: promocion.descuento,
          fecha_inicio: fIni.toJSDate(),
          fecha_fin: fFin.toJSDate(),
        }
      });



    }

    // 4) Transacción: crear vuelo -> tarifas -> (configuracion_asientos opcional si quieres duplicar) -> noticia
    const result = await this.prisma.$transaction(async (tx) => {
      const nuevoVuelo = await tx.vuelo.create({
        data: {
          id_aeronaveFK,
          id_aeropuerto_origenFK,
          id_aeropuerto_destinoFK,
          salida_programada_utc: departureUTCDate,
          llegada_programada_utc: arrivalUTCDate,
          id_promocionFK: promocionCreada ? promocionCreada.id_promocion : null,
          estado: 'Programado',
        }
      });

      // crear tarifas para las 2 clases con los precios que envía el admin
      const tarifasToCreate = [
        tx.tarifa.create({
          data: {
            id_vueloFK: nuevoVuelo.id_vuelo,
            clase: 'economica',
            precio_base: precio_economica,
          }
        }),
        tx.tarifa.create({
          data: {
            id_vueloFK: nuevoVuelo.id_vuelo,
            clase: 'primera_clase',
            precio_base: precio_primera_clase,
          }
        })
      ];
      await Promise.all(tarifasToCreate);

      // NOTA: no duplicamos configuracion_asientos (ya existe para aeronave); si quieres crear registros por vuelo,
      // puedes crear entradas copy aquí. Por ahora vamos a usar la config existente para devolver los números.
      // crear noticia vinculada al vuelo
      const noticia = await tx.noticia.create({
        data: {
          id_vueloFK: nuevoVuelo.id_vuelo,
          titulo,
          descripcion_corta,
          descripcion_larga,
          url_imagen,
        },
        include: {
          vuelo: {
            include: {
              aeronave: true,
              promocion: true,
              tarifa: true,
              aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: { include: { ciudad: { include: { pais: true, gmt: true } } } },
              aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: { include: { ciudad: { include: { pais: true, gmt: true } } } },
            }
          }
        }
      });

      return { noticia, nuevoVueloId: nuevoVuelo.id_vuelo };
    });

    // 5) Preparar respuesta que necesita el frontend (Noticia)
    const created = result.noticia;
    const vuelo = created.vuelo;

    // extraer configuración de asientos desde la config que consultamos antes
    const asientos_economica = confEconomica ? confEconomica.cantidad : null;
    const asientos_primera_clase = confPrimera ? confPrimera.cantidad : null;

    // precios por clase que creamos
    const precioEconomica = precio_economica;
    const precioPrimera = precio_primera_clase;

    return {
      titulo: created.titulo,
      descripcion_corta: created.descripcion_corta,
      descripcion_larga: created.descripcion_larga,
      url_imagen: created.url_imagen,
      modelo_aeronave: aeronave.modelo,
      capacidad_aeronave: aeronave.capacidad,
      asientos_economica,
      asientos_primera_clase,
      precio_economica: precioEconomica,
      precio_primera_clase: precioPrimera,
      promocion: vuelo.promocion ? {
        nombre: vuelo.promocion.nombre,
        descripcion: vuelo.promocion.descripcion,
        descuento: vuelo.promocion.descuento ?? vuelo.promocion.descuento ?? null,
        fecha_inicio: vuelo.promocion.fecha_inicio.toISOString(),
        fecha_fin: vuelo.promocion.fecha_fin.toISOString(),
      } : null,
      estado: String(vuelo.estado),
      salida_programada_utc: new Date(vuelo.salida_programada_utc).toISOString(),
      llegada_programada_utc: new Date(vuelo.llegada_programada_utc).toISOString(),
      salida_local_origen: departureLocalOrigin.toISO(),
      llegada_local_destino: arrivalLocalDest.toISO(),
      salida_colombia: depBog.toISO(),
      llegada_colombia: arrBog.toISO(),
      origen: {
        ciudad: aeropuertoOrigen.ciudad?.nombre ?? null,
        pais: aeropuertoOrigen.ciudad?.pais?.nombre ?? null,
      },
      destino: {
        ciudad: aeropuertoDestino.ciudad?.nombre ?? null,
        pais: aeropuertoDestino.ciudad?.pais?.nombre ?? null,
      },
    };
  }


}
