import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';

import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

import { RegisterDto } from './dto/register.dto';

import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful, returns auth tokens and expire date.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOi...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
        token: { type: 'string', example: 'eyJhbGciOi...' },
        bearer: { type: 'string', example: 'eyJhbGciOi...' },
        token_type: { type: 'string', example: 'Bearer' },
        expire_date: {
          type: 'string',
          format: 'date-time',
          example: '2026-06-12T10:16:58.000Z',
        },
        expires_at: {
          type: 'string',
          format: 'date-time',
          example: '2026-06-12T10:16:58.000Z',
        },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@Req() req: { user: { sub: number; refreshToken: string } }) {
    return this.authService.refreshToken(req.user.sub, req.user.refreshToken);
  }
}
