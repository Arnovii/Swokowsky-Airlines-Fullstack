import { IsInt, IsOptional, IsBoolean, IsISO8601, Min, Max, IsNumber, maxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";

export class SearchFlightsDto {
    @Type(() => Number)
    @IsInt()
    originCityId: number;

    @Type(() => Number)
    @IsInt()
    destinationCityId: number;

    // Fecha de salida (solo ida: required). Puede ser 'YYYY-MM-DD' o ISO datetime.
    @ApiProperty({ example: '2024-12-31T04:06:28.975Z', description: 'Representa la fecha de ida de un vuelo' })
    @IsISO8601()
    departureDate: string;

    @ApiProperty({ example: 'true', description: 'True: Vuelo ida y vuelta. False: Vuela solo de ida'})
    @IsBoolean()
    roundTrip: boolean;

    // Si roundTrip=true, se espera returnDate
    @ApiProperty({ example: '2025-01-20T04:06:28.975Z', description: 'Representa la fecha de vuelta de un vuelo (Solo necesita enviarse si roundTrip=true)'})
    @IsOptional()
    @IsISO8601()
    returnDate?: string;

    @ApiProperty({ example: '3', description: 'Representa el número de pasajeros que desean tomar el vuelo (de 1 a 5)', minimum:1, maximum:5})
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    passengers: number;
}
