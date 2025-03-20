import {
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';
import { LoginResDto } from '@/auth/dto/res/login.res.dto';
import { LogoutResDto } from '@/auth/dto/res/logout.res.dto';
import { RefreshTokenResDto } from '@/auth/dto/res/refresh-token.res.dto';
import { Role } from '@/constants/type';

describe('AuthController', () => {
  let i18nService: I18nService;
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(new LoginResDto()),
            logout: jest.fn().mockResolvedValue(new LogoutResDto()),
            processNewToken: jest
              .fn()
              .mockResolvedValue(new RefreshTokenResDto()),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn().mockReturnValue('translated-message'),
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

    i18nService = module.get<I18nService>(I18nService);
    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: '123123',
      };

      const mockResData: LoginResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.login'),
        data: {
          id: 1,
          email: 'test@example.com',
          role: Role.Owner,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResData);
      const result = await authController.login(loginDto);
      const resultDto = Object.assign(new LoginResDto(), result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(resultDto).toBeInstanceOf(LoginResDto);
    });

    it('should throw an error when password is incorrect', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException({
          message: i18nService.translate(
            'errors.auth.invalid-email-or-password',
          ),
          errors: [
            {
              field: 'password',
              message: i18nService.translate(
                'errors.auth.invalid-email-or-password',
              ),
            },
          ],
        }),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error when email is not found', async () => {
      const loginDto: LoginReqDto = {
        email: 'notfound@example.com',
        password: '123123',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException({
          message: i18nService.translate('errors.auth.invalid-email'),
          errors: [
            {
              field: 'email',
              message: i18nService.translate('errors.auth.invalid-email'),
            },
          ],
        }),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should call logout method successfully', async () => {
      const logoutDto: LogoutReqDto = { refreshToken: 'refresh-token' };

      const mockResData: LogoutResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.logout'),
      };

      (authService.logout as jest.Mock).mockResolvedValue(mockResData);
      const result = await authController.logout(logoutDto);
      const resultDto = Object.assign(new LogoutResDto(), result);
      expect(authService.logout).toHaveBeenCalledWith(logoutDto.refreshToken);
      expect(resultDto).toBeInstanceOf(LogoutResDto);
    });

    it('should throw an error when refreshToken is invalid', async () => {
      const logoutDto: LogoutReqDto = { refreshToken: 'invalid-refresh-token' };

      (authService.logout as jest.Mock).mockRejectedValue(
        new UnauthorizedException(
          i18nService.translate('errors.auth.invalid-refresh-token'),
        ),
      );

      await expect(authController.logout(logoutDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.logout).toHaveBeenCalledWith(logoutDto.refreshToken);
    });
  });

  describe('refresh', () => {
    it('should return new refresh token', async () => {
      const refreshDto: RefreshTokenReqDto = {
        refreshToken: 'refresh-token',
      };

      const mockResData: RefreshTokenResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.refresh-token'),
        data: {
          id: 1,
          email: 'test@example.com',
          role: Role.Owner,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      (authService.processNewToken as jest.Mock).mockResolvedValue(mockResData);
      const result = await authController.refresh(refreshDto);
      const resultDto = Object.assign(new RefreshTokenResDto(), result);
      expect(authService.processNewToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
      expect(resultDto).toBeInstanceOf(RefreshTokenResDto);
    });

    it('should throw an error when refreshToken is invalid', async () => {
      const refreshDto: RefreshTokenReqDto = {
        refreshToken: 'invalid-refresh-token',
      };

      (authService.processNewToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException(
          i18nService.translate('errors.auth.invalid-refresh-token'),
        ),
      );

      await expect(authController.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.processNewToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
    });
  });
});
