import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Gudang Jakarta Pusat' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'WH-JKT-01' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Jl. Gajah Mada No. 10, Jakarta Pusat' })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiPropertyOptional({ example: -6.1754 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 106.8272 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Type(() => Number)
  totalCapacity!: number;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsNotEmpty()
  @IsString()
  managerName!: string;

  @ApiProperty({ example: '08123456789' })
  @IsNotEmpty()
  @IsString()
  managerPhone!: string;
}
