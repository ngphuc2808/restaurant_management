import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Reflector } from '@nestjs/core';

import { GuestController } from '@/guest/guest.controller';
import { GuestService } from '@/guest/guest.service';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestLogoutReqDto } from '@/guest/dto/req/guest-logout.req.dto';
import { Role } from '@/constants/type';

describe('GuestController', () => {
  let controller: GuestController;
  let guestService: GuestService;

  const mockGuest = {
    id: 1,
    name: 'Test Guest',
    role: Role.Guest,
    tableNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginResponse = {
    guest: mockGuest,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestController],
      providers: [
        {
          provide: GuestService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated text'),
          },
        },
      ],
    }).compile();

    controller = module.get<GuestController>(GuestController);
    guestService = module.get<GuestService>(GuestService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(guestService).toBeDefined();
  });

  describe('login', () => {
    const loginDto: GuestLoginReqDto = {
      name: 'Test Guest',
      tableNumber: 1,
      token: 'valid-token',
    };

    it('should login successfully', async () => {
      jest.spyOn(guestService, 'login').mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(guestService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(guestService, 'login').mockRejectedValue(new Error());

      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    const logoutDto: GuestLogoutReqDto = {
      id: 1,
    };

    it('should logout successfully', async () => {
      jest.spyOn(guestService, 'logout').mockResolvedValue(undefined);

      await controller.logout(logoutDto);

      expect(guestService.logout).toHaveBeenCalledWith(logoutDto.id);
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(guestService, 'logout').mockRejectedValue(new Error());

      await expect(controller.logout(logoutDto)).rejects.toThrow();
    });
  });
});
