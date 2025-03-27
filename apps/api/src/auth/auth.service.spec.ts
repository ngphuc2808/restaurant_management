import { Test, TestingModule } from '@nestjs/testing';
import {
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcryptjs';
import * as ms from 'ms';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { PrismaErrorCode } from '@/utils/errors';

import { Account } from '@prisma/client';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketService } from '@/socket/socket.service';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { PrismaService } from '@/prisma.service';
import { Role } from '@/constants/type';

jest.mock('bcryptjs');
jest.mock('ms');
jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let refreshTokenService: RefreshTokenService;
  let socketService: SocketService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;
  let logger: Logger;

  const mockAccount: Account = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'USER',
    avatar: 'avatar.jpg',
    ownerId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSocket = {
    handshake: {
      auth: {
        Authorization: 'Bearer valid-token',
      },
    },
    id: 'socket-id',
  } as unknown as Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated-message'),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
          },
        },
        {
          provide: SocketService,
          useValue: {
            upsertSocket: jest.fn().mockResolvedValue(undefined),
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
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            account: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    socketService = module.get<SocketService>(SocketService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
    logger = module.get<Logger>(Logger);

    jest.clearAllMocks();
  });

  describe('validateSocket', () => {
    it('should validate socket successfully', async () => {
      const mockDecodedToken = { id: 1, role: 'USER' };
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecodedToken);
      jest.spyOn(socketService, 'upsertSocket').mockResolvedValue(undefined);

      const result = await service.validateSocket(mockSocket);

      expect(result).toEqual(mockDecodedToken);
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_TOKEN_SECRET');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'secret',
      });
      expect(socketService.upsertSocket).toHaveBeenCalledWith(
        1,
        'socket-id',
        'USER',
      );
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const invalidSocket = {
        handshake: {
          auth: {},
        },
        id: 'socket-id',
      } as unknown as Socket<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap
      >;

      await expect(service.validateSocket(invalidSocket)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when token verification fails', async () => {
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateSocket(mockSocket)).rejects.toThrow(
        'Invalid token',
      );
    });
  });

  describe('validateAccount', () => {
    it('should validate account successfully', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateAccount(
        'test@example.com',
        'password',
      );

      expect(result).toEqual(mockAccount);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnprocessableEntityException when password is invalid', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateAccount('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('generateTokens', () => {
    it('should generate tokens successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.generateTokens(mockAccount);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should handle token generation error', async () => {
      jest
        .spyOn(jwtService, 'signAsync')
        .mockRejectedValue(new Error('Token error'));

      await expect(service.generateTokens(mockAccount)).rejects.toThrow(
        'Token error',
      );
    });
  });

  describe('getAccessToken', () => {
    it('should generate access token successfully for regular user', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      (configService.get as jest.Mock)
        .mockResolvedValueOnce('15m') // JWT_ACCESS_TOKEN_EXPIRES_IN
        .mockResolvedValueOnce('secret'); // JWT_ACCESS_TOKEN_SECRET
      (ms as jest.Mock).mockReturnValue(900000); // 15 minutes

      const result = await service.getAccessToken({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result).toBe('access-token');
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
      );
    });

    it('should generate access token successfully for guest', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');
      (configService.get as jest.Mock)
        .mockResolvedValueOnce('30m') // GUEST_JWT_ACCESS_TOKEN_EXPIRES_IN
        .mockResolvedValueOnce('secret'); // JWT_ACCESS_TOKEN_SECRET
      (ms as jest.Mock).mockReturnValue(1800000); // 30 minutes

      const result = await service.getAccessToken({
        id: 1,
        role: Role.Guest,
      });

      expect(result).toBe('access-token');
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(configService.get).toHaveBeenNthCalledWith(
        1,
        'GUEST_JWT_ACCESS_TOKEN_EXPIRES_IN',
      );
      expect(configService.get).toHaveBeenNthCalledWith(
        2,
        'JWT_ACCESS_TOKEN_SECRET',
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should generate refresh token successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('refresh-token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(604800000); // 7 days
      jest.spyOn(refreshTokenService, 'insert').mockResolvedValue(undefined);

      const result = await service.getRefreshToken({
        id: 1,
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('refreshTokenExpiresAt');
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(refreshTokenService.insert).toHaveBeenCalled();
    });
  });

  describe('getGuestRefreshToken', () => {
    it('should generate guest refresh token successfully', async () => {
      const guestData = {
        id: 1,
        role: Role.Guest,
      };

      const mockRefreshToken = 'mock-refresh-token';
      const mockExpiresIn = '14d';
      const mockSecret = 'mock-secret';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockRefreshToken);
      (configService.get as jest.Mock)
        .mockResolvedValueOnce(mockExpiresIn) // GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN
        .mockResolvedValueOnce(mockSecret); // JWT_REFRESH_TOKEN_SECRET
      (ms as jest.Mock).mockReturnValue(1209600000); // 14 days in milliseconds

      const result = await service.getGuestRefreshToken(guestData);

      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result).toHaveProperty('refreshTokenExpiresAt');
      expect(result.refreshTokenExpiresAt).toBeInstanceOf(Date);

      expect(configService.get).toHaveBeenCalledWith(
        'GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN',
      );
      expect(configService.get).toHaveBeenCalledWith(
        'JWT_REFRESH_TOKEN_SECRET',
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(guestData, {
        secret: mockSecret,
        expiresIn: 1209600, // 14 days in seconds
      });
    });

    it('should use default values when config is not available', async () => {
      const guestData = { id: 1, role: Role.Guest };
      const expiresTime = '14d';
      (configService.get as jest.Mock)
        .mockReturnValueOnce(expiresTime) // GUEST_JWT_REFRESH_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('secret'); // JWT_REFRESH_TOKEN_SECRET
      (ms as jest.Mock).mockReturnValue(1209600000); // 14 days in milliseconds
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.getGuestRefreshToken(guestData);

      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('refreshTokenExpiresAt');

      expect(jwtService.signAsync).toHaveBeenCalledWith(guestData, {
        secret: 'secret',
        expiresIn: 1209600, // 14 days in seconds
      });
    });

    it('should throw error when token generation fails', async () => {
      const guestData = {
        id: 1,
        role: Role.Guest,
      };

      const errorMessage = 'Token generation failed';
      jest
        .spyOn(jwtService, 'signAsync')
        .mockRejectedValue(new Error(errorMessage));

      const errorSpy = jest.spyOn(logger, 'error');

      await expect(service.getGuestRefreshToken(guestData)).rejects.toThrow(
        errorMessage,
      );

      expect(errorSpy).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('generateGuestTokens', () => {
    it('should generate guest tokens successfully', async () => {
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(604800000); // 7 days

      const result = await service.generateGuestTokens(1);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during guest token generation', async () => {
      jest
        .spyOn(jwtService, 'signAsync')
        .mockRejectedValue(new Error('Token generation failed'));
      (configService.get as jest.Mock).mockResolvedValue('secret');
      (ms as jest.Mock).mockReturnValue(604800000);

      await expect(service.generateGuestTokens(1)).rejects.toThrow(
        'Token generation failed',
      );
    });
  });

  describe('processNewToken', () => {
    it('should process new token successfully', async () => {
      const mockDecodedToken = { id: 1, email: 'test@example.com' };
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecodedToken);
      jest.spyOn(refreshTokenService, 'validate').mockResolvedValue(true);
      jest
        .spyOn(refreshTokenService, 'invalidate')
        .mockResolvedValue(undefined);
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.processNewToken('refresh-token');

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ id: 1, email: 'test@example.com' });
      jest.spyOn(refreshTokenService, 'validate').mockResolvedValue(false);

      await expect(service.processNewToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('processNewGuestToken', () => {
    it('should process new guest token successfully', async () => {
      const mockDecodedToken = { id: 1, role: Role.Guest };
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockDecodedToken);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.processNewGuestToken('refresh-token');

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', {
        secret: 'secret',
      });
    });

    it('should throw error when token verification fails', async () => {
      (configService.get as jest.Mock).mockResolvedValue('secret');
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.processNewGuestToken('invalid-token'),
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      jest
        .spyOn(refreshTokenService, 'invalidate')
        .mockResolvedValue(undefined);

      await service.logout('refresh-token');

      expect(refreshTokenService.invalidate).toHaveBeenCalledWith(
        'refresh-token',
      );
    });

    it('should throw UnprocessableEntityException when token is not found', async () => {
      jest.spyOn(refreshTokenService, 'invalidate').mockRejectedValue({
        code: PrismaErrorCode.RecordNotFound,
      });

      await expect(service.logout('invalid-token')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('loginGoogle', () => {
    const mockUser = {
      email: 'test@example.com',
    };
    const mockRes = {
      redirect: jest.fn(),
    };

    beforeEach(() => {
      (configService.get as jest.Mock).mockReturnValue('http://localhost:3000');
    });

    it('should handle successful Google login', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      (configService.get as jest.Mock)
        .mockReturnValueOnce('http://localhost:3000')
        .mockReturnValueOnce('secret');
      (ms as jest.Mock).mockReturnValue(900000);

      await service.loginGoogle(mockUser as any, mockRes as any);

      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(mockRes.redirect).toHaveBeenCalled();
    });

    it('should handle non-existent account', async () => {
      jest.spyOn(prismaService.account, 'findUnique').mockResolvedValue(null);

      await expect(
        service.loginGoogle(mockUser as any, mockRes as any),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(mockRes.redirect).toHaveBeenCalled();
    });

    it('should handle token generation error', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockRejectedValue(new Error('Token error'));

      await expect(
        service.loginGoogle(mockUser as any, mockRes as any),
      ).rejects.toThrow('Token error');
      expect(mockRes.redirect).toHaveBeenCalled();
    });
  });
});
