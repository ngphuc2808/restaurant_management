import { Logger, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

  const mockAuthResponse = {
    account: {
      id: mockAccount.id,
      email: mockAccount.email,
      role: mockAccount.role,
      avatar: mockAccount.avatar,
      name: mockAccount.name,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            processNewToken: jest.fn(),
            logout: jest.fn(),
            loginGoogle: jest.fn(),
          },
        },
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
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginReqDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should login successfully', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(mockAuthResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const logoutDto: LogoutReqDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should logout successfully', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await authController.logout(logoutDto);

      expect(authService.logout).toHaveBeenCalledWith(logoutDto.refreshToken);
    });

    it('should throw UnauthorizedException when logout fails', async () => {
      jest
        .spyOn(authService, 'logout')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.logout(logoutDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    const refreshDto: RefreshTokenReqDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh token successfully', async () => {
      jest
        .spyOn(authService, 'processNewToken')
        .mockResolvedValue(mockAuthResponse);

      const result = await authController.refresh(refreshDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.processNewToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jest
        .spyOn(authService, 'processNewToken')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(authController.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthCallback', () => {
    const mockReq = {
      user: {
        email: 'test@example.com',
      },
    };
    const mockRes = {
      redirect: jest.fn(),
    };

    it('should handle successful Google authentication', async () => {
      jest.spyOn(authService, 'loginGoogle').mockResolvedValue(undefined);

      await authController.googleAuthCallback(mockReq as any, mockRes as any);

      expect(authService.loginGoogle).toHaveBeenCalledWith(
        mockReq.user,
        mockRes,
      );
    });

    it('should handle Google authentication error', async () => {
      const error = new UnauthorizedException('Google auth failed');
      jest.spyOn(authService, 'loginGoogle').mockRejectedValue(error);

      await expect(
        authController.googleAuthCallback(mockReq as any, mockRes as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
