import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExist = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (userExist) {
      throw new ConflictException('Email already exists');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashPassword,
      role: 'ADMIN',
    });

    return await this.userRepo.save(user);
  }

  async login(dto: LoginDto & { email?: string }) {
    const identifier = dto.email ?? dto.username; // dukung frontend yang kirim email langsung

    const user = await this.userRepo.findOne({
      where: {
        email: identifier,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException();
    }

    return this.generateToken(user);
  }

  async generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefresh;

    await this.userRepo.save(user);

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);

    return {
      accessToken,
      refreshToken,
      token: accessToken,
      bearer: accessToken,
      token_type: 'Bearer',
      expire_date: expireDate.toISOString(),
      expires_at: expireDate.toISOString(),
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!valid) {
      throw new UnauthorizedException();
    }

    return this.generateToken(user);
  }
}
