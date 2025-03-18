import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';

import { Account } from '@prisma/client';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';

import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

const mockAccount: Account = {
  name: 'Test User',
  id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  avatar: '',
  role: 'user',
  ownerId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLoginDto: LoginReqDto = {
  email: 'test@example.com',
  password: 'password',
};

const mockJwtPayload = {
  id: 1,
  email: 'test@example.com',
  role: 'user',
};

const mockAccessToken = 'mockAccessToken';
const mockRefreshToken = 'mockRefreshToken';

const mockPrismaService = () => ({
  account: {
    findUnique: jest.fn(),
  },
});

const mockJwtService = () => ({
  signAsync: jest.fn(() => Promise.resolve(mockAccessToken)),
  verifyAsync: jest.fn(() => Promise.resolve(mockJwtPayload)),
});

const mockRefreshTokenService = () => ({
  insert: jest.fn(),
  validate: jest.fn(() => Promise.resolve(true)),
  invalidate: jest.fn(),
  removeToken: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') {
      return '7d';
    }
    if (key === 'JWT_REFRESH_TOKEN_SECRET') {
      return 'refreshTokenSecret';
    }
    return null;
  }),
});

const mockI18nService = () => ({
  t: jest.fn((key: string) => key),
});

const mockLogger = () => ({
  error: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: ReturnType<typeof mockPrismaService>;
  let jwtService: ReturnType<typeof mockJwtService>;
  let refreshTokenService: ReturnType<typeof mockRefreshTokenService>;
  let configService: ReturnType<typeof mockConfigService>;
  let i18nService: ReturnType<typeof mockI18nService>;
  let logger: ReturnType<typeof mockLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: RefreshTokenService, useFactory: mockRefreshTokenService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: I18nService, useFactory: mockI18nService },
        { provide: Logger, useFactory: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService =
      module.get<ReturnType<typeof mockPrismaService>>(PrismaService);
    jwtService = module.get<ReturnType<typeof mockJwtService>>(JwtService);
    refreshTokenService =
      module.get<ReturnType<typeof mockRefreshTokenService>>(
        RefreshTokenService,
      );
    configService =
      module.get<ReturnType<typeof mockConfigService>>(ConfigService);
    i18nService = module.get<ReturnType<typeof mockI18nService>>(I18nService);
    logger = module.get<ReturnType<typeof mockLogger>>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAccountWithEmail', () => {
    it('should return an account if it exists', async () => {
      prismaService.account.findUnique.mockResolvedValue(mockAccount);
      const result = await service.findAccountWithEmail(mockAccount.email);
      expect(result).toEqual(mockAccount);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: mockAccount.email },
      });
    });

    it('should throw UnprocessableEntityException if account does not exist', async () => {
      prismaService.account.findUnique.mockResolvedValue(null);
      await expect(
        service.findAccountWithEmail(mockAccount.email),
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(i18nService.t).toHaveBeenCalledWith('errors.login.invalid-email');
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'Database error';
      prismaService.account.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );
      try {
        await service.findAccountWithEmail(mockAccount.email);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('validateAccount', () => {
    it('should return the account if email exists and password matches', async () => {
      prismaService.account.findUnique.mockResolvedValue(mockAccount);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      const result = await service.validateAccount(
        mockAccount.email,
        'password',
      );
      expect(result).toEqual(mockAccount);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: mockAccount.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnprocessableEntityException if email does not exist', async () => {
      prismaService.account.findUnique.mockResolvedValue(null);
      await expect(
        service.validateAccount(mockAccount.email, 'password'),
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(i18nService.t).toHaveBeenCalledWith('errors.login.invalid-email');
    });

    it('should throw UnprocessableEntityException if password does not match', async () => {
      prismaService.account.findUnique.mockResolvedValue(mockAccount);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      await expect(
        service.validateAccount(mockAccount.email, 'wrongPassword'),
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(i18nService.t).toHaveBeenCalledWith(
        'errors.login.invalid-email-or-password',
      );
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'Database error';
      prismaService.account.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );
      try {
        await service.validateAccount(mockAccount.email, 'password');
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('login', () => {
    it('should call validateAccount and generateTokens on successful validation', async () => {
      jest.spyOn(service, 'validateAccount').mockResolvedValue(mockAccount);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        ...mockJwtPayload,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      const result = await service.login(mockLoginDto);
      expect(service.validateAccount).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(service.generateTokens).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual({
        ...mockJwtPayload,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'Validation error';
      jest
        .spyOn(service, 'validateAccount')
        .mockRejectedValue(new Error(errorMessage));
      try {
        await service.login(mockLoginDto);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      jest
        .spyOn(service, 'getRefreshToken')
        .mockResolvedValue(mockRefreshToken);
      const result = await service.generateTokens(mockAccount);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockAccount.id,
        email: mockAccount.email,
        role: mockAccount.role,
      });
      expect(service.getRefreshToken).toHaveBeenCalledWith({
        id: mockAccount.id,
        email: mockAccount.email,
        role: mockAccount.role,
      });
      expect(result).toEqual({
        id: mockAccount.id,
        email: mockAccount.email,
        role: mockAccount.role,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'JWT error';
      jwtService.signAsync.mockRejectedValue(new Error(errorMessage));
      try {
        await service.generateTokens(mockAccount);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('getRefreshToken', () => {
    it('should generate and store a refresh token', async () => {
      const expiresTime = '7d';
      const secret = 'refreshTokenSecret';
      const expiresInSeconds = ms(expiresTime) / 1000;
      const expectedExpiresAt = new Date(Date.now() + ms(expiresTime));

      const result = await service.getRefreshToken(mockJwtPayload);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret,
        expiresIn: expiresInSeconds,
      });
      expect(refreshTokenService.insert).toHaveBeenCalledWith(
        mockJwtPayload.id,
        mockAccessToken,
        expect.any(Date), // Check if it's a Date object
      );
      expect(result).toEqual(mockAccessToken);
      // Basic check for date validity, more precise check might be needed if time sensitivity is critical
      expect(
        (refreshTokenService.insert as jest.Mock).mock.calls[0][2].getTime(),
      ).toBeGreaterThanOrEqual(expectedExpiresAt.getTime() - 1000); // Allow for slight timing differences
      expect(
        (refreshTokenService.insert as jest.Mock).mock.calls[0][2].getTime(),
      ).toBeLessThanOrEqual(expectedExpiresAt.getTime() + 1000);
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'JWT error';
      jwtService.signAsync.mockRejectedValue(new Error(errorMessage));
      try {
        await service.getRefreshToken(mockJwtPayload);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('processNewToken', () => {
    it('should verify, validate, invalidate old token and generate new tokens', async () => {
      prismaService.account.findUnique.mockResolvedValue(mockAccount);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        ...mockJwtPayload,
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const result = await service.processNewToken(mockRefreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'refreshTokenSecret',
      });
      expect(refreshTokenService.validate).toHaveBeenCalledWith(
        mockJwtPayload.id,
        mockRefreshToken,
      );
      expect(refreshTokenService.invalidate).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: mockJwtPayload.email },
      });
      expect(service.generateTokens).toHaveBeenCalledWith(mockAccount);
      expect(result).toEqual({
        ...mockJwtPayload,
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);
      refreshTokenService.validate.mockResolvedValue(false);

      await expect(
        service.processNewToken(mockRefreshToken),
      ).rejects.toThrowError(UnauthorizedException);
      expect(i18nService.t).toHaveBeenCalledWith('errors.token.invalid');
    });

    it('should log error if an exception occurs during verification', async () => {
      const errorMessage = 'JWT verification error';
      jwtService.verifyAsync.mockRejectedValue(new Error(errorMessage));
      try {
        await service.processNewToken(mockRefreshToken);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });

    it('should log error if an exception occurs during validation', async () => {
      const errorMessage = 'Redis error';
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);
      refreshTokenService.validate.mockRejectedValue(new Error(errorMessage));
      try {
        await service.processNewToken(mockRefreshToken);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });

    it('should log error if an exception occurs while finding account', async () => {
      const errorMessage = 'Database error';
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);
      refreshTokenService.validate.mockResolvedValue(true);
      prismaService.account.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );
      try {
        await service.processNewToken(mockRefreshToken);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });

    it('should log error if an exception occurs while generating tokens', async () => {
      const errorMessage = 'JWT error';
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);
      refreshTokenService.validate.mockResolvedValue(true);
      prismaService.account.findUnique.mockResolvedValue(mockAccount);
      jwtService.signAsync.mockRejectedValue(new Error(errorMessage));

      try {
        await service.processNewToken(mockRefreshToken);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });

  describe('logout', () => {
    it('should call refreshTokenService.removeToken', async () => {
      await service.logout(mockRefreshToken);
      expect(refreshTokenService.removeToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
    });

    it('should log error if an exception occurs', async () => {
      const errorMessage = 'Redis error';
      refreshTokenService.removeToken.mockRejectedValue(
        new Error(errorMessage),
      );
      try {
        await service.logout(mockRefreshToken);
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(errorMessage);
      }
    });
  });
});
