import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSlaPolicyDto {
  @ApiProperty({ example: 'Express' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 24, description: 'Batas waktu pengiriman dalam jam' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxDeliveryHours!: number;

  @ApiPropertyOptional({ example: 80, description: 'Persentase waktu SLA untuk kirim warning' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  warningThresholdPercent?: number;
}
