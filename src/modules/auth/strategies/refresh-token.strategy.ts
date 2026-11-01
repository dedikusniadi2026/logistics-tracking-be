import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: process.env.JWT_REFRESH_SECRET!,

      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: { sub: number; email: string; role: string },
  ) {
    // Accept refresh token from Authorization header OR custom header
    // Authorization: Bearer <refreshToken>
    // X-Refresh-Token: <refreshToken>
    const headerAuth = req.get('authorization');
    const authToken = headerAuth?.startsWith('Bearer ')
      ? headerAuth.replace('Bearer ', '')
      : undefined;

    const refreshTokenHeader = req.get('x-refresh-token');

    const refreshToken = authToken ?? refreshTokenHeader;

    return {
      ...payload,
      refreshToken,
    };
  }
}
