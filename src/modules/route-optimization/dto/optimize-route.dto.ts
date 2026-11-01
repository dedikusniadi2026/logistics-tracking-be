import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinateDto {
  @ApiProperty({ example: -6.2 })
  latitude!: number;

  @ApiProperty({ example: 106.8 })
  longitude!: number;

  @ApiPropertyOptional({ example: 'Toko Maju Jaya' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class OptimizeRouteDto {
  @ApiProperty({ description: 'Titik awal (depot/gudang)', type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  origin!: CoordinateDto;

  @ApiProperty({ description: 'Daftar tujuan pengiriman', type: [CoordinateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  destinations!: CoordinateDto[];

  @ApiPropertyOptional({ example: 'distance', enum: ['distance', 'time', 'fuel'] })
  @IsOptional()
  @IsString()
  optimizeFor?: 'distance' | 'time' | 'fuel';

  @ApiPropertyOptional({ example: 1, description: 'Driver ID untuk auto-dispatch' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverId?: number;
}

export class AutoDispatchDto {
  @ApiProperty({ description: 'Shipment IDs yang akan di-dispatch', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  shipmentIds!: number[];

  @ApiPropertyOptional({ example: 'nearest', enum: ['nearest', 'balanced', 'priority'] })
  @IsOptional()
  @IsString()
  strategy?: 'nearest' | 'balanced' | 'priority';
}
