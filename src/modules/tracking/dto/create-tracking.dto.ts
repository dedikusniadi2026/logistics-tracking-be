import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTrackingDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  shipmentId!: number;

  @ApiProperty({ example: -6.2088 })
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({ example: 106.8456 })
  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @ApiProperty({
    example: 54.2,
    required: false,
    description: 'Vehicle speed (optional)',
  })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiProperty({
    example: 120.5,
    required: false,
    description: 'Vehicle heading/bearing in degrees (optional)',
  })
  @IsNumber()
  @IsOptional()
  heading?: number;

  @ApiProperty({
    example: '2026-06-11T10:16:58.000Z',
    required: false,
    description:
      'Client timestamp (optional). If omitted, server timestamp is used.',
  })
  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @ApiProperty({
    example: 'IN_TRANSIT',
    required: false,
    description: 'Optional status update',
  })
  @IsString()
  @IsOptional()
  status?: string;
}
