import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidateCheckinDto } from './dto/validate-checkin.dto';
import { AssignSeatDto } from './dto/assign-seat.dto';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';
import { GenerateCodeDto } from './dto/generate-code.dto';

@ApiTags('check-in (público)')
@Controller('checkin')
export class CheckinController {
  constructor(private readonly service: CheckinService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generar código único para un ticket (llamar desde backend al completar compra)' })
  async generateCode(@Body() dto: GenerateCodeDto) {
    return this.service.generateAndSaveCode(dto.ticketId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar código único y DNI para iniciar el check-in' })
  async validate(@Body() dto: ValidateCheckinDto) {
    return this.service.validateCode(dto.codigo_unico, dto.dni);
  }

  @Get('asientos/:id_vuelo')
  @ApiOperation({ summary: 'Obtener mapa de asientos para un vuelo (basado en configuración de aeronave + tickets)' })
  async getSeats(@Param('id_vuelo', ParseIntPipe) id_vuelo: number) {
    return this.service.getSeatsForFlight(id_vuelo);
  }

  @Post('asignar-asiento')
  @ApiOperation({ summary: 'Asignar asiento al ticket usando código único' })
  async assignSeat(@Body() dto: AssignSeatDto) {
    return this.service.assignSeat(dto.codigo_unico, dto.asiento);
  }

  @Post('confirmar')
  @ApiOperation({ summary: 'Confirmar check-in y deshabilitar el código' })
  async confirm(@Body() dto: ConfirmCheckinDto) {
    return this.service.confirmCheckin(dto.codigo_unico);
  }
}
