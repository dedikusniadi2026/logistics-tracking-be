import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Admin Logistics', description: 'Nama user' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'admin@gmail.com', description: 'Email user' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password user (min 6 karakter)',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '08123456789', description: 'Nomor telepon user' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
