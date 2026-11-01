import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@gmail.com',
    required: false,
    description: 'Email (preferred). Backend also supports username field.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'admin@gmail.com',
    required: false,
    description: 'Username (backend menyamakan dengan email).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password user',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
