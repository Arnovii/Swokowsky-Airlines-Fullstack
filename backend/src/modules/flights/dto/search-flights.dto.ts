import { IsInt, IsOptional, IsBoolean, IsISO8601, Min, Max, IsNumber, maxLength, Matches, isNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";

export class SearchFlightsDto {
    @ApiProperty({ example: '1', description: 'Es el ID que tenga una ciudad (origen) en la base de datos' })
    @Type(() => Number)
    @IsInt()
    originCityId: number;

    @ApiProperty({ example: '31', description: 'Es el ID que tenga una ciudad (destino) en la base de datos' })
    @Type(() => Number)
    @IsInt()
    destinationCityId: number;

    // Fecha de salida (solo ida: required). Puede ser 'YYYY-MM-DD' o ISO datetime.
    @ApiProperty({ example: '2025-11-01', description: 'Representa la fecha de ida de un vuelo' })
    @IsISO8601()
    departureDate: string;

    @ApiProperty({ example: 'true', description: 'True: Vuelo ida y vuelta. False: Vuela solo de ida' })
    @IsBoolean()
    roundTrip: boolean;

    // Si roundTrip=true, se espera returnDate
    @ApiProperty({ example: '2025-11-28', description: 'Representa la fecha de vuelta de un vuelo (Solo necesita enviarse si roundTrip=true)' })
    @IsOptional()
    @IsISO8601()
    returnDate?: string;

    @ApiProperty({ example: '2', description: 'Representa el número de pasajeros que desean tomar el vuelo (de 1 a 5)', minimum: 1, maximum: 5 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    passengers: number;

    @ApiProperty({ example: '00:00', description: 'Hora inicial para filtrar vuelos de partida (formato HH:mm, hora Colombia)', required: false })
    @IsOptional()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'initialHour debe estar en formato HH:mm (00:00-23:59)' })
    initialHour?: string;

    @ApiProperty({ example: '18:00', description: 'Hora final para filtrar vuelos de partida (formato HH:mm, hora Colombia)', required: false })
    @IsOptional()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'finalHour debe estar en formato HH:mm (00:00-23:59)' })
    finalHour?: string;
    
    @ApiProperty({ example: 0, description: 'Valor mínimo dispuesto a pagar por el cliente', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minimumPrice ?: number;
    
    @ApiProperty({ example: 999999999, description: 'Valor máximo dispuesto a pagar por el cliente', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    maximumPrice ?: number;

}
