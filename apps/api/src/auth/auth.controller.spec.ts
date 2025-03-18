import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenGuard } from '@/auth/guards/refresh-token.guard';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';
import { LoginResDto } from '@/auth/dto/res/login.res.dto';
import { LogoutResDto } from '@/auth/dto/res/logout.res.dto';
import { RefreshTokenResDto } from '@/auth/dto/res/refresh-token.res.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    processNewToken: jest.fn(),
  };

  const mockRefreshTokenGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: RefreshTokenGuard, useValue: mockRefreshTokenGuard },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the provided LoginReqDto and return a LoginResDto', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult: LoginResDto = {
        statusCode: HttpStatus.OK,
        message: 'res.success.login',
        data: {
          id: 1,
          email: 'test@example.com',
          role: 'Employee',
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
        },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should use RefreshTokenGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.logout,
      );
      expect(metadata).toContain(RefreshTokenGuard);
    });

    it('should call authService.logout with the refreshToken from LogoutReqDto and return a LogoutResDto', async () => {
      const logoutDto: LogoutReqDto = { refreshToken: 'mockRefreshToken' };
      const expectedResult: LogoutResDto = {
        statusCode: HttpStatus.OK,
        message: 'res.success.logout',
      };
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(logoutDto);

      expect(mockAuthService.logout).toHaveBeenCalledWith(
        logoutDto.refreshToken,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should use RefreshTokenGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.refresh,
      );
      expect(metadata).toContain(RefreshTokenGuard);
    });

    it('should call authService.processNewToken with the refreshToken from RefreshTokenReqDto and return a RefreshTokenResDto', async () => {
      const refreshTokenDto: RefreshTokenReqDto = {
        refreshToken: 'mockRefreshToken',
      };
      const expectedResult: RefreshTokenResDto = {
        statusCode: HttpStatus.OK,
        message: 'res.success.refresh-token',
        data: {
          id: 1,
          email: 'test@example.com',
          role: 'Employee',
          accessToken: 'newAccessToken',
          refreshToken: 'newRefreshToken',
        },
      };
      mockAuthService.processNewToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshTokenDto);

      expect(mockAuthService.processNewToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
