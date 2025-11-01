
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightResultDto } from './dto/flight-result.dto';

@Injectable()
export class FlightsService {
  constructor(private prisma: PrismaService) { }

  async getAllFlights() {
    return this.prisma.vuelo.findMany({
      include: {
        aeronave: true,
        tarifa: true,
        promocion: true,
        aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: true,
        aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: true,
      },
    });
  }

  private dayRangeFromDateString(dateStr: string) {
    // Interpretamos dateStr como fecha (YYYY-MM-DD o ISO). Buscamos entre [00:00:00, 23:59:59] UTC
    const dayStart = new Date(dateStr);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayStart.getUTCDate() + 1);
    return { dayStart, dayEnd };
  }

  private async computeAvailableSeatsForAeronave(aeronaveId: number, id_vuelo: number) {
    // Sumamos configuración_asientos para la aeronave
    const configs = await this.prisma.configuracion_asientos.findMany({
      where: { id_aeronaveFK: aeronaveId },
      select: { cantidad: true },
    });
    const totalConfigured = configs.reduce((s, c) => s + (c.cantidad ?? 0), 0);

    // Contamos tickets ocupados (todos los tickets que no estén 'cancelado')
    const occupied = await this.prisma.ticket.count({
      where: {
        id_vueloFK: id_vuelo,
        estado: { not: 'cancelado' }, // tus estados válidos: pagado, usado, cancelado
      },
    });

    const availableSeats = Math.max(0, totalConfigured - occupied);
    return { availableSeats, totalConfigured };
  }

  private formatLocalFromUtc(utcDate: Date | string, offsetHours: number | null) {
    if (!utcDate || offsetHours === null || offsetHours === undefined) return null;
    const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    const local = new Date(dateObj.getTime() + offsetHours * 60 * 60 * 1000);
    return local.toISOString();
  }

  /**
   * Busca vuelos para una combinación (originCityId, destinationCityId, date)
   */
  private async findFlightsForDay(originCityId: number, destCityId: number, dateStr: string) {
    const { dayStart, dayEnd } = this.dayRangeFromDateString(dateStr);

    const vuelos = await this.prisma.vuelo.findMany({
      where: {
        salida_programada_utc: { gte: dayStart, lt: dayEnd },
        aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
          ciudad: { id_ciudad: originCityId },
        },
        aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
          ciudad: { id_ciudad: destCityId },
        },
      },
      include: {
        aeronave: {
          select: { id_aeronave: true, modelo: true },
        },
        tarifa: true,
        promocion: true,
        aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto: {
          include: { ciudad: { include: { pais: true, gmt: true } } },
        },
        aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto: {
          include: { ciudad: { include: { pais: true, gmt: true } } },
        },
      },
      orderBy: { salida_programada_utc: 'asc' },
    });

    // Mapear resultados y calcular available_seats + horas locales
    const results: FlightResultDto[] = [];
    for (const v of vuelos) {
      const { availableSeats, totalConfigured } = await this.computeAvailableSeatsForAeronave(v.id_aeronaveFK, v.id_vuelo);

      const origenGmtOffset = v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto?.ciudad?.gmt?.offset ?? null;
      const destinoGmtOffset = v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto?.ciudad?.gmt?.offset ?? null;

      const salida_local = this.formatLocalFromUtc(v.salida_programada_utc, origenGmtOffset);
      const llegada_local = this.formatLocalFromUtc(v.llegada_programada_utc, destinoGmtOffset);

      results.push({
        id_vuelo: v.id_vuelo,
        estado: v.estado,
        salida_programada_utc: (v.salida_programada_utc as Date).toISOString(),
        llegada_programada_utc: (v.llegada_programada_utc as Date).toISOString(),
        salida_local,
        llegada_local,
        aeronave: {
          id_aeronave: v.aeronave.id_aeronave,
          modelo: v.aeronave.modelo,
          capacidad: totalConfigured,
        },
        tarifas: v.tarifa.map((t) => ({ clase: t.clase, precio_base: t.precio_base })),
        promocion: v.promocion ? { id_promocion: v.promocion.id_promocion, nombre: v.promocion.nombre, descuento: v.promocion.descuento } : null,
        aeropuerto_origen: {
          id_aeropuerto: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.id_aeropuerto,
          nombre: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.nombre,
          codigo_iata: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.codigo_iata,
          ciudad: {
            id_ciudad: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.id_ciudad,
            nombre: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.nombre,
            pais: {
              id_pais: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.pais.id_pais,
              nombre: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.pais.nombre,
            },
            gmt: {
              id_gmt: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.gmt.id_gmt,
              offset: v.aeropuerto_vuelo_id_aeropuerto_origenFKToaeropuerto.ciudad.gmt.offset,
            },
          },
        },
        aeropuerto_destino: {
          id_aeropuerto: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.id_aeropuerto,
          nombre: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.nombre,
          codigo_iata: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.codigo_iata,
          ciudad: {
            id_ciudad: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.id_ciudad,
            nombre: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.nombre,
            pais: {
              id_pais: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.pais.id_pais,
              nombre: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.pais.nombre,
            },
            gmt: {
              id_gmt: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.gmt.id_gmt,
              offset: v.aeropuerto_vuelo_id_aeropuerto_destinoFKToaeropuerto.ciudad.gmt.offset,
            },
          },
        },
        available_seats: availableSeats,
      });
    }

    return results;
  }

  /**
   * Public: recibe los filtros y devuelve:
   * - si roundTrip=false -> lista de vuelos para la fecha de ida (filtrados por disponibilidad)
   * - si roundTrip=true  -> objeto { outbound: [...], inbound: [...] } validando disponibilidad en ambos
   */
  async searchFlights(filters: SearchFlightsDto) {
    const { originCityId, destinationCityId, departureDate, roundTrip, returnDate, passengers } = filters;

    if (passengers > 5) {
      throw new BadRequestException('El número máximo de pasajeros permitido por búsqueda es 5.');
    }

    // Buscamos vuelos ida
    const outbound = await this.findFlightsForDay(originCityId, destinationCityId, departureDate);

    // Filtramos por disponibilidad >= passengers
    const outboundAvailable = outbound.filter((f) => f.available_seats >= passengers);

    if (!roundTrip) {
      return { type: 'oneway', results: outboundAvailable };
    }

    // Round trip => returnDate required
    if (!returnDate) {
      throw new BadRequestException('Para búsqueda ida y vuelta se requiere returnDate.');
    }

    // Buscamos vuelos de vuelta (origen/destino invertidos)
    const inbound = await this.findFlightsForDay(destinationCityId, originCityId, returnDate);
    const inboundAvailable = inbound.filter((f) => f.available_seats >= passengers);

    // Validación adicional: si no hay vuelos de ida o vuelta disponibles, devolvemos info clara
    if (outboundAvailable.length === 0 || inboundAvailable.length === 0) {
      return {
        type: 'roundtrip',
        outboundAvailableCount: outboundAvailable.length,
        inboundAvailableCount: inboundAvailable.length,
        outbound: outboundAvailable,
        inbound: inboundAvailable,
        message: 'No se encontraron combinaciones completas con la disponibilidad solicitada. Revisa fechas o reduce número de pasajeros.',
      };
    }

    return {
      type: 'roundtrip',
      outbound: outboundAvailable,
      inbound: inboundAvailable,
    };
  }

  /**
 * Versión limpia para frontend: retorna solo los datos útiles de los vuelos
 */
  async searchFlightsClean(filters: SearchFlightsDto) {
    const {
      originCityId,
      destinationCityId,
      departureDate,
      roundTrip,
      returnDate,
      passengers,
      initialHour,
      finalHour,
      minimumPrice,
      maximumPrice,
    } = filters;

    if (passengers > 5) {
      throw new BadRequestException('El número máximo de pasajeros permitido por búsqueda es 5.');
    }

    // Validación simple de precios (ya vienen como number según DTO)
    const minPrice = (minimumPrice !== undefined && minimumPrice !== null) ? minimumPrice : null;
    const maxPrice = (maximumPrice !== undefined && maximumPrice !== null) ? maximumPrice : null;

    if (minPrice !== null && typeof minPrice !== 'number') {
      throw new BadRequestException('minimumPrice inválido');
    }
    if (maxPrice !== null && typeof maxPrice !== 'number') {
      throw new BadRequestException('maximumPrice inválido');
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      throw new BadRequestException('minimumPrice no puede ser mayor que maximumPrice.');
    }

    // Buscamos vuelos ida
    const outbound = await this.findFlightsForDay(originCityId, destinationCityId, departureDate);
    // Filtramos por disponibilidad >= passengers
    const outboundAvailable = outbound.filter((f) => f.available_seats >= passengers);

    // Helpers
    const formatDate = (iso: string | Date | null) => {
      if (!iso) return null;
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      return d.toISOString().slice(0, 10);
    };
    const formatHour = (iso: string | Date | null) => {
      if (!iso) return null;
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      return d.toISOString().slice(11, 16);
    };
    const toColombiaTime = (iso: string | Date | null) => {
      if (!iso) return null;
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      // Colombia = UTC-5 => restamos 5 horas
      const colombia = new Date(d.getTime() + (-5) * 60 * 60 * 1000);
      return colombia;
    };

    // utilidades para filtrar por hora (solo para outbound)
    const toMinutes = (hhmm: string) => {
      const [hh, mm] = hhmm.split(':').map(Number);
      return hh * 60 + mm;
    };
    const isInHourRange = (timeHHMM: string | null) => {
      if (!timeHHMM) return false;
      if (!initialHour && !finalHour) return true;
      const mins = toMinutes(timeHHMM);
      if (initialHour && finalHour) {
        const start = toMinutes(initialHour);
        const end = toMinutes(finalHour);
        if (start <= end) {
          // intervalo normal
          return mins >= start && mins <= end;
        } else {
          // cruza medianoche
          return mins >= start || mins <= end;
        }
      }
      if (initialHour) return mins >= toMinutes(initialHour);
      return mins <= toMinutes(finalHour!);
    };

    // Nuevo: comprobar si alguna de las dos clases (precio_base) está dentro del rango
    const classPriceMatchesRange = (v): boolean => {
      // Si no hay filtros de precio, todo pasa
      if (minPrice === null && maxPrice === null) return true;

      if (!v.tarifas || !Array.isArray(v.tarifas) || v.tarifas.length === 0) {
        // No hay tarifas para comparar -> excluir si hay filtro de precio
        return false;
      }

      // Buscamos precio_base de 'economica' y 'primera_clase' (si existen)
      let precioEconomica: number | null = null;
      let precioPrimera: number | null = null;
      for (const t of v.tarifas) {
        if (t.clase === 'economica' && t.precio_base != null) {
          const n = Number(t.precio_base);
          if (!Number.isNaN(n)) precioEconomica = n;
        }
        if (t.clase === 'primera_clase' && t.precio_base != null) {
          const n = Number(t.precio_base);
          if (!Number.isNaN(n)) precioPrimera = n;
        }
      }

      const check = (price: number | null) => {
        if (price === null) return false;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      };

      // Si cualquiera de las dos clases cumple, devolvemos true
      return check(precioEconomica) || check(precioPrimera);
    };

    const cleanFlight = (v) => {
      // Extraer precios por clase (sin tocar promociones)
      let precio_economica = null;
      let precio_primera_clase = null;
      if (v.tarifas) {
        for (const t of v.tarifas) {
          if (t.clase === 'economica') precio_economica = t.precio_base;
          if (t.clase === 'primera_clase') precio_primera_clase = t.precio_base;
        }
      }
      // Horas locales y Colombia
      const salidaColombia = toColombiaTime(v.salida_programada_utc);
      const llegadaColombia = toColombiaTime(v.llegada_programada_utc);

      return {
        id_vuelo: v.id_vuelo,
        estado: v.estado,
        modelo_aeronave: v.aeronave?.modelo ?? null,
        capacidad_aeronave: v.aeronave?.capacidad ?? null,
        precio_economica,
        precio_primera_clase,
        promocion: v.promocion
          ? {
            nombre: v.promocion.nombre,
            descuento: v.promocion.descuento,
          }
          : null,
        fecha_salida_programada: formatDate(v.salida_programada_utc),
        fecha_llegada_programada: formatDate(v.llegada_programada_utc),
        hora_salida_utc: formatHour(v.salida_programada_utc),
        hora_llegada_utc: formatHour(v.llegada_programada_utc),
        hora_salida_local_destino: formatHour(v.llegada_local),
        hora_llegada_local_destino: formatHour(v.salida_local),
        hora_salida_colombia: salidaColombia ? formatHour(salidaColombia) : null,
        hora_llegada_colombia: llegadaColombia ? formatHour(llegadaColombia) : null,
        available_seats: v.available_seats,
        origen: v.aeropuerto_origen
          ? {
            nombre: v.aeropuerto_origen.nombre,
            codigo_iata: v.aeropuerto_origen.codigo_iata,
            ciudad: v.aeropuerto_origen.ciudad?.nombre,
            pais: v.aeropuerto_origen.ciudad?.pais?.nombre,
          }
          : null,
        destino: v.aeropuerto_destino
          ? {
            nombre: v.aeropuerto_destino.nombre,
            codigo_iata: v.aeropuerto_destino.codigo_iata,
            ciudad: v.aeropuerto_destino.ciudad?.nombre,
            pais: v.aeropuerto_destino.ciudad?.pais?.nombre,
          }
          : null,
      };
    };

    // Aplicar filtro por hora sobre vuelos de IDA (outbound) y por precio (según nueva regla)
    const outboundAvailableFiltered = outboundAvailable.filter((v) => {
      // Hora en Colombia
      const salidaCol = toColombiaTime(v.salida_programada_utc);
      const horaCol = salidaCol ? formatHour(salidaCol) : null;
      const hourOk = isInHourRange(horaCol);

      // Precio (comparamos precio_base de economica o primera_clase, sin promociones)
      const priceOk = classPriceMatchesRange(v);

      return hourOk && priceOk;
    });

    if (!roundTrip) {
      return { type: 'oneway', results: outboundAvailableFiltered.map(cleanFlight) };
    }

    // Round trip => returnDate required
    if (!returnDate) {
      throw new BadRequestException('Para búsqueda ida y vuelta se requiere returnDate.');
    }

    // Buscamos vuelos de vuelta (origen/destino invertidos)
    const inbound = await this.findFlightsForDay(destinationCityId, originCityId, returnDate);
    const inboundAvailable = inbound.filter((f) => f.available_seats >= passengers);

    // Para inbound aplicamos filtro de precio (mismo criterio), no filtramos por hora
    const inboundAvailableFiltered = inboundAvailable.filter((v) => classPriceMatchesRange(v));

    return {
      type: 'roundtrip',
      outbound: outboundAvailableFiltered.map(cleanFlight),
      inbound: inboundAvailableFiltered.map(cleanFlight),
    };
  }


}

