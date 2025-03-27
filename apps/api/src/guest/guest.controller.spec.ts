import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Reflector } from '@nestjs/core';

import { GuestController } from '@/guest/guest.controller';
import { GuestService } from '@/guest/guest.service';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestLogoutReqDto } from '@/guest/dto/req/guest-logout.req.dto';
import { GuestRefreshTokenReqDto } from '@/guest/dto/req/guest-refresh-token.req.dto';
import { GuestCreateDishReqDto } from '@/guest/dto/req/guest-create-dish.req.dto';
import { Role, OrderStatus, DishStatus } from '@/constants/type';

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

  const mockUser = {
    id: 1,
    role: Role.Guest,
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
            processNewGuestToken: jest.fn(),
            createDish: jest.fn(),
            getListOrder: jest.fn(),
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

  describe('refresh', () => {
    const refreshDto: GuestRefreshTokenReqDto = {
      refreshToken: 'valid-refresh-token',
    };

    const mockRefreshResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should refresh token successfully', async () => {
      jest
        .spyOn(guestService, 'processNewGuestToken')
        .mockResolvedValue(mockRefreshResponse);

      const result = await controller.refresh(refreshDto);

      expect(result).toEqual(mockRefreshResponse);
      expect(guestService.processNewGuestToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
    });

    it('should throw error when service fails', async () => {
      jest
        .spyOn(guestService, 'processNewGuestToken')
        .mockRejectedValue(new Error());

      await expect(controller.refresh(refreshDto)).rejects.toThrow();
    });
  });

  describe('create', () => {
    const createDishDto: GuestCreateDishReqDto[] = [
      {
        quantity: 2,
        dishId: 1,
      },
    ];

    const mockCreateResponse = [
      {
        id: 1,
        quantity: 2,
        status: OrderStatus.Pending,
        tableNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        guestId: 1,
        dishSnapshotId: 1,
        orderHandlerId: null,
        dishSnapshot: {
          id: 1,
          name: 'Test Dish',
          description: 'Test Description',
          price: 100,
          image: 'test.jpg',
          status: DishStatus.Available,
          dishId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        guest: {
          id: 1,
          name: 'Test Guest',
          tableNumber: 1,
          refreshToken: 'token',
          refreshTokenExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        orderHandler: null,
      },
    ];

    it('should create order successfully', async () => {
      jest
        .spyOn(guestService, 'createDish')
        .mockResolvedValue(mockCreateResponse);

      const result = await controller.create(mockUser, createDishDto);

      expect(result).toEqual(mockCreateResponse);
      expect(guestService.createDish).toHaveBeenCalledWith(
        mockUser.id,
        createDishDto,
      );
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(guestService, 'createDish').mockRejectedValue(new Error());

      await expect(
        controller.create(mockUser, createDishDto),
      ).rejects.toThrow();
    });
  });

  describe('getList', () => {
    const mockListResponse = [
      {
        id: 1,
        quantity: 2,
        status: OrderStatus.Pending,
        tableNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        guestId: 1,
        dishSnapshotId: 1,
        orderHandlerId: null,
        dishSnapshot: {
          id: 1,
          name: 'Test Dish',
          description: 'Test Description',
          price: 100,
          image: 'test.jpg',
          status: DishStatus.Available,
          dishId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        guest: {
          id: 1,
          name: 'Test Guest',
          tableNumber: 1,
          refreshToken: 'token',
          refreshTokenExpiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        orderHandler: null,
      },
    ];

    it('should get list of orders successfully', async () => {
      jest
        .spyOn(guestService, 'getListOrder')
        .mockResolvedValue(mockListResponse);

      const result = await controller.getList(mockUser);

      expect(result).toEqual(mockListResponse);
      expect(guestService.getListOrder).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(guestService, 'getListOrder').mockRejectedValue(new Error());

      await expect(controller.getList(mockUser)).rejects.toThrow();
    });
  });
});
