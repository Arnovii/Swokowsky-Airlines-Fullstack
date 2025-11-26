import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

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
}
