import { IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { vuelo_estado } from '.prisma/client/wasm';

class PromotionInsideFlightDto {
    // ⚠️ ¡CAMBIO CRUCIAL AQUÍ!
    @IsOptional() 
    @IsNumber() 
    id_promocion?: number; 
    // ----------------------

    @IsString()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsNumber()
    descuento: number;

    @IsDateString()
    fecha_inicio: string;

    @IsDateString()
    fecha_fin: string;
}

export class UpdateFlightDto {
    @IsOptional()
    @IsDateString()
    salida_programada_utc?: string;

    @IsOptional()
    @IsDateString()
    llegada_programada_utc?: string;

    @IsOptional()
    promocion?: PromotionInsideFlightDto;

    @IsEnum(vuelo_estado)
    estado: vuelo_estado;
}
