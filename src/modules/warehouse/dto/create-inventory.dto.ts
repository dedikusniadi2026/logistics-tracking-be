import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  warehouseId!: number;

  @ApiProperty({ example: 'SKU-BOX-001' })
  @IsNotEmpty()
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Kardus 30x30' })
  @IsNotEmpty()
  @IsString()
  productName!: string;

  @ApiPropertyOptional({ example: 'Kardus packing ukuran 30x30cm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStockLevel?: number;

  @ApiPropertyOptional({ example: 'A-12-3' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsString()
  barcodeValue?: string;
}
