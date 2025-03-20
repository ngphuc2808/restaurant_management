import {
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcryptjs';

import { Account } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { Role } from '@/constants/type';

describe('AuthService', () => {
  let configService: ConfigService;
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            account: {
              findUnique: jest.fn(),
            },
            socket: {
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_REFRESH_TOKEN_SECRET') return 'secret';
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION') return '7d';
              return null;
            }),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
            removeToken: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens for valid user', async () => {
      const body: LoginReqDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync = jest.fn().mockResolvedValue('mockAccessToken');
      authService.getRefreshToken = jest
        .fn()
        .mockResolvedValue('mockRefreshToken');

      const result = await authService.login(body);

      expect(result.accessToken).toBe('mockAccessToken');
      expect(result.refreshToken).toBe('mockRefreshToken');
    });

    it('should throw UnprocessableEntityException for incorrect email', async () => {
      prismaService.account.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException for incorrect password', async () => {
      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('validateSocket', () => {
    it('should throw UnauthorizedException if Authorization header is missing', async () => {
      const socket = { handshake: { auth: {} } } as Socket;
      await expect(authService.validateSocket(socket)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle guest socket connections correctly', async () => {
      const socket = {
        id: 'socket123',
        handshake: { auth: { Authorization: 'Bearer validToken' } },
      } as unknown as Socket;

      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue({ id: 1, role: Role.Guest });
      prismaService.socket.upsert = jest.fn();

      await authService.validateSocket(socket);

      expect(prismaService.socket.upsert).toHaveBeenCalledWith({
        where: { guestId: 1 },
        update: { socketId: 'socket123' },
        create: { guestId: 1, socketId: 'socket123' },
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const socket = {
        handshake: { auth: { Authorization: 'Bearer invalidToken' } },
      } as unknown as Socket;
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('Invalid token'));
      await expect(authService.validateSocket(socket)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('processNewToken', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('Invalid token'));
      await expect(authService.processNewToken('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('Token expired'));
      await expect(authService.processNewToken('expiredToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens for valid refresh token', async () => {
      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jwtService.verifyAsync = jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'test@example.com' });
      refreshTokenService.validate = jest.fn().mockResolvedValue(true);
      prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
      authService.generateTokens = jest.fn().mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const result = await authService.processNewToken('validToken');

      expect(result.accessToken).toBe('newAccessToken');
      expect(result.refreshToken).toBe('newRefreshToken');
    });
  });

  describe('logout', () => {
    it('should log an error if removeToken fails', async () => {
      const error = new Error('Database error');
      refreshTokenService.removeToken = jest.fn().mockRejectedValue(error);
      jest.spyOn(authService['logger'], 'error');

      await expect(authService.logout('mockRefreshToken')).rejects.toThrow(
        error,
      );
      expect(authService['logger'].error).toHaveBeenCalledWith(
        'Database error',
      );
    });

    it('should call removeToken on logout', async () => {
      refreshTokenService.removeToken = jest.fn();

      await authService.logout('mockRefreshToken');

      expect(refreshTokenService.removeToken).toHaveBeenCalledWith(
        'mockRefreshToken',
      );
    });
  });

  describe('findAccountWithEmail', () => {
    it('should return account if found', async () => {
      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
      const result = await authService.findAccountWithEmail('test@example.com');
      expect(result).toEqual(account);
    });

    it('should throw UnprocessableEntityException if account is not found', async () => {
      prismaService.account.findUnique = jest.fn().mockResolvedValue(null);
      await expect(
        authService.findAccountWithEmail('test@example.com'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('validateAccount', () => {
    it('should return account if credentials are valid', async () => {
      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await authService.validateAccount(
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(account);
    });

    it('should throw UnprocessableEntityException if password is incorrect', async () => {
      prismaService.account.findUnique = jest
        .fn()
        .mockResolvedValue({ password: 'hashedPassword' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(
        authService.validateAccount('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      jwtService.signAsync = jest.fn().mockResolvedValue('accessToken');
      const account = { id: 1, email: 'test@example.com', role: Role.Employee };
      const result = await authService.getAccessToken(account);
      expect(result).toBe('accessToken');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token', async () => {
      jwtService.signAsync = jest.fn().mockResolvedValue('refreshToken');
      refreshTokenService.insert = jest.fn().mockResolvedValue(undefined);
      const account = { id: 1, email: 'test@example.com', role: Role.Employee };
      const result = await authService.getRefreshToken(account);
      expect(result).toBe('refreshToken');
      expect(refreshTokenService.insert).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const account: Account = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.Employee,
        avatar: null,
        name: 'Test User',
        ownerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await authService.generateTokens(account);

      expect(result).toEqual({
        account: {
          id: 1,
          email: 'test@example.com',
          role: Role.Employee,
          avatar: null,
          name: 'Test User',
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });
});
