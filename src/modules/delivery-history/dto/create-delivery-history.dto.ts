import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryHistoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  shipmentId!: number;

  @ApiProperty({ example: 'IN_TRANSIT' })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({ example: 'Driver left the warehouse.', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
