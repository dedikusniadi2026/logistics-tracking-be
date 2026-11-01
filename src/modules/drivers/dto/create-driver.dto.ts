import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'A-123456789' })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiProperty({
    example: 'AVAILABLE',
    enum: ['AVAILABLE', 'ON_DELIVERY', 'INACTIVE'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['AVAILABLE', 'ON_DELIVERY', 'INACTIVE'])
  status?: string;
}
