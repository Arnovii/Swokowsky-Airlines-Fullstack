import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class RechargeDto {
  @IsInt()
  idUsuario: number;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsInt()
  idTarjeta: number; // opcional si quieres validar la tarjeta usada
}