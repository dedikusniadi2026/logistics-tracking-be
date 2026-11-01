import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ScanBarcodeDto {
  @ApiProperty({ example: '123456789012', description: 'Barcode atau QR code value' })
  @IsNotEmpty()
  @IsString()
  barcodeValue!: string;

  @ApiPropertyOptional({ example: 1, description: 'ID warehouse (opsional untuk filter)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  warehouseId?: number;
}

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: 'Jumlah yang ditambah (positif) atau dikurangi (negatif)' })
  @IsInt()
  @Type(() => Number)
  adjustment!: number;

  @ApiPropertyOptional({ example: 'Stock opname' })
  @IsOptional()
  @IsString()
  reason?: string;
}
