import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'B 1234 CD' })
  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @ApiProperty({ example: 'Isuzu Elf' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 'Truck' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 4000 })
  @IsNumber()
  capacity!: number;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
  status?: string;
}
