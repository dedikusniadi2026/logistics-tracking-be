import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdateShipmentDto {
  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  driverId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @ApiProperty({
    example: 'ASSIGNED',
    enum: [
      'PENDING',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn([
    'PENDING',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ])
  status?: string;

  @ApiProperty({ example: '2026-06-15T12:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;

  @ApiProperty({ example: '2026-06-11T12:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  actualDelivery?: string;
}
