/* eslint-disable */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Partial<Record<keyof Repository<User>, jest.Mock>> & {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const userBase: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'ADMIN',
    refreshToken: undefined,
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'jwt-refresh-secret';

    jwtService = {
      sign: jest.fn(),
    };

    jest.spyOn(bcrypt as any, 'hash').mockImplementation(async () => 'hash');
    jest.spyOn(bcrypt as any, 'compare').mockImplementation(async () => true);

    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register: should create user with hashed password and ADMIN role', async () => {
    userRepo.findOne.mockResolvedValue(null);

    const dto: any = {
      name: 'Test',
      email: 'test@example.com',
      password: 'plain-password',
      phone: '08123456789',
    };

    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('hashed-password');

    const createdUser: any = {
      ...dto,
      password: 'hashed-password',
      role: 'ADMIN',
    };

    userRepo.create.mockReturnValue(createdUser);
    userRepo.save.mockResolvedValue({ id: 1, ...createdUser });

    const result = await service.register(dto);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(userRepo.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashed-password',
      role: 'ADMIN',
    });
    expect(userRepo.save).toHaveBeenCalledWith(createdUser);
    expect(result).toEqual({ id: 1, ...createdUser });
  });

  it('register: should throw ConflictException if email already exists', async () => {
    userRepo.findOne.mockResolvedValue(userBase);

    await expect(
      service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'plain-password',
        phone: '08123456789',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('login: should validate password and return tokens', async () => {
    userRepo.findOne.mockResolvedValue({
      ...userBase,
      password: 'stored-hash',
    });
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    // generateToken
    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
      'hashed-refresh-token',
    );
    userRepo.save.mockResolvedValue({
      ...userBase,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.login({
      email: 'test@example.com',
      password: 'plain-password',
    });

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plain-password',
      'stored-hash',
    );

    expect(jwtService.sign).toHaveBeenNthCalledWith(
      1,
      {
        sub: userBase.id,
        email: userBase.email,
        role: userBase.role,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '1d' },
    );
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      2,
      {
        sub: userBase.id,
        email: userBase.email,
        role: userBase.role,
      },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('refresh-token', 10);
    expect(userRepo.save).toHaveBeenCalled();

    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        token: 'access-token',
        bearer: 'access-token',
        token_type: 'Bearer',
        expire_date: expect.any(String),
        expires_at: expect.any(String),
      }),
    );
  });

  it('login: should throw UnauthorizedException if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // compare should not be required when user is not found
  });

  it('login: should throw UnauthorizedException if password invalid', async () => {
    userRepo.findOne.mockResolvedValue({
      ...userBase,
      password: 'stored-hash',
    });
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshToken: should validate refresh token and return tokens', async () => {
    userRepo.findOne.mockResolvedValue({
      ...userBase,
      refreshToken: 'stored-hashed-refresh-token',
    });

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
      'new-hashed-refresh-token',
    );
    userRepo.save.mockResolvedValue({
      ...userBase,
      refreshToken: 'new-hashed-refresh-token',
    });

    const result = await service.refreshToken(1, 'raw-refresh-token');

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'raw-refresh-token',
      'stored-hashed-refresh-token',
    );
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        token: 'access-token',
        bearer: 'access-token',
        token_type: 'Bearer',
        expire_date: expect.any(String),
        expires_at: expect.any(String),
      }),
    );
  });

  it('refreshToken: should throw UnauthorizedException if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.refreshToken(999, 'raw-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshToken: should throw UnauthorizedException if refresh token invalid', async () => {
    userRepo.findOne.mockResolvedValue({
      ...userBase,
      refreshToken: 'stored-hashed-refresh-token',
    });

    (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

    await expect(
      service.refreshToken(1, 'raw-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('generateToken: should sign access/refresh and persist hashed refresh token', async () => {
    const user: any = {
      ...userBase,
      refreshToken: 'old-hash',
    };

    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
      'hashed-refresh-token',
    );
    userRepo.save.mockResolvedValue({
      ...user,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.generateToken(user);

    expect(jwtService.sign).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).toHaveBeenCalledWith('refresh-token', 10);
    expect(userRepo.save).toHaveBeenCalled();
    expect(user.refreshToken).toBe('hashed-refresh-token');

    expect(result).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        token: 'access-token',
        bearer: 'access-token',
        token_type: 'Bearer',
        expire_date: expect.any(String),
        expires_at: expect.any(String),
      }),
    );
  });
});
