import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IotTelemetryDto {
  @ApiProperty({ example: 'TRACKER-001', description: 'Device ID dari hardware GPS tracker' })
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @ApiProperty({ example: -6.2 })
  @IsNumber()
  @Type(() => Number)
  latitude!: number;

  @ApiProperty({ example: 106.8 })
  @IsNumber()
  @Type(() => Number)
  longitude!: number;

  @ApiPropertyOptional({ example: 60.5, description: 'Kecepatan dalam km/h' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  speed?: number;

  @ApiPropertyOptional({ example: 180, description: 'Heading/arah dalam derajat (0-360)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  heading?: number;

  @ApiPropertyOptional({ example: 85.5, description: 'Level baterai perangkat (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  batteryLevel?: number;

  @ApiPropertyOptional({ example: -70, description: 'Kekuatan sinyal (dBm)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  signalStrength?: number;

  @ApiPropertyOptional({ example: '2024-01-01T10:00:00Z', description: 'Timestamp dari device (opsional, default server time)' })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class RegisterIotDeviceDto {
  @ApiProperty({ example: 'TRACKER-001' })
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @ApiProperty({ example: '359273043905678' })
  @IsNotEmpty()
  @IsString()
  imei!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vehicleId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverId?: number;

  @ApiPropertyOptional({ example: '1.2.3' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reportIntervalSecs?: number;
}
