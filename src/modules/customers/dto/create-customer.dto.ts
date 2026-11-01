import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Indah Cargo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'contact@indahcargo.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '081299998888' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Jl. Jendral Sudirman No. 123, Jakarta' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: -6.2088, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 106.8456, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
