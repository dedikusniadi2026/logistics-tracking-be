import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  customerId!: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  driverId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @ApiProperty({ example: 'Warehouse A, Jakarta' })
  @IsString()
  @IsNotEmpty()
  originAddress!: string;

  @ApiProperty({ example: 'Customer Office, Bandung' })
  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  @ApiProperty({ example: -6.2088 })
  @IsNumber()
  @IsNotEmpty()
  originLatitude!: number;

  @ApiProperty({ example: 106.8456 })
  @IsNumber()
  @IsNotEmpty()
  originLongitude!: number;

  @ApiProperty({ example: -6.9175 })
  @IsNumber()
  @IsNotEmpty()
  destinationLatitude!: number;

  @ApiProperty({ example: 107.6191 })
  @IsNumber()
  @IsNotEmpty()
  destinationLongitude!: number;

  @ApiProperty({ example: '2026-06-15T12:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;
}
