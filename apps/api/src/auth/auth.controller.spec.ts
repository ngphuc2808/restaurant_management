import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LoginReqDto } from '@/auth/dto/req/login.req.dto';
import { LogoutReqDto } from '@/auth/dto/req/logout.req.dto';
import { RefreshTokenReqDto } from '@/auth/dto/req/refresh-token.req.dto';
import { LoginResDto } from '@/auth/dto/res/login.res.dto';
import { LogoutResDto } from '@/auth/dto/res/logout.res.dto';
import { RefreshTokenResDto } from '@/auth/dto/res/refresh-token.res.dto';

describe('AuthController', () => {
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
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto: LoginReqDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await authController.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBeInstanceOf(LoginResDto);
    });
  });

  describe('logout', () => {
    it('should call logout method', async () => {
      const logoutDto: LogoutReqDto = { refreshToken: 'some-refresh-token' };
      await authController.logout(logoutDto);
      expect(authService.logout).toHaveBeenCalledWith(logoutDto.refreshToken);
    });
  });

  describe('refresh', () => {
    it('should return new refresh token', async () => {
      const refreshDto: RefreshTokenReqDto = {
        refreshToken: 'some-refresh-token',
      };
      const result = await authController.refresh(refreshDto);
      expect(authService.processNewToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
      expect(result).toBeInstanceOf(RefreshTokenResDto);
    });
  });
});
