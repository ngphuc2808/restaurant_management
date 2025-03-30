import { Test, TestingModule } from '@nestjs/testing';
import {
  Logger,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { SocketGateway } from '@/socket/socket-gateway';
import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { TableService } from '@/table/table.service';
import { GuestService } from '@/guest/guest.service';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestCreateDishReqDto } from '@/guest/dto/req/guest-create-dish.req.dto';
import { CreateGuestReqDto } from '@/guest/dto/req/create-guest.req.dto';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { Role, TableStatus, OrderStatus, DishStatus } from '@/constants/type';
import { PrismaErrorCode } from '@/utils/errors';

jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('GuestService', () => {
  let service: GuestService;
  let prismaService: PrismaService;
  let authService: AuthService;
  let tableService: TableService;
  let i18nService: I18nService;
  let logger: Logger;
  let socketGateway: SocketGateway;

  const mockGuest = {
    id: 1,
    name: 'Test Guest',
    tableNumber: 1,
    refreshToken: 'mock-refresh-token',
    refreshTokenExpiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTable = {
    id: 1,
    number: 1,
    token: 'valid-token',
    status: TableStatus.Available,
    capacity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: {
      refreshToken: 'mock-refresh-token',
      refreshTokenExpiresAt: new Date(),
    },
  };

  const mockDish = {
    id: 1,
    name: 'Test Dish',
    description: 'Test Description',
    price: 100,
    image: 'test.jpg',
    status: DishStatus.Available,
    createdAt: new Date(),
    updatedAt: new Date(),
    dishId: 1,
  };

  const mockOrder = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestService,
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
          provide: PrismaService,
          useValue: {
            guest: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            table: {
              findUnique: jest.fn(),
            },
            dish: {
              findUnique: jest.fn(),
            },
            dishSnapshot: {
              create: jest.fn(),
            },
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prismaService)),
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateGuestTokens: jest.fn(),
            processNewGuestToken: jest.fn(),
          },
        },
        {
          provide: TableService,
          useValue: {
            getTableByToken: jest.fn(),
          },
        },
        {
          provide: SocketGateway,
          useValue: {
            server: {
              to: jest.fn().mockReturnThis(),
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GuestService>(GuestService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    tableService = module.get<TableService>(TableService);
    i18nService = module.get<I18nService>(I18nService);
    logger = module.get<Logger>(Logger);
    socketGateway = module.get<SocketGateway>(SocketGateway);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(authService).toBeDefined();
    expect(tableService).toBeDefined();
    expect(i18nService).toBeDefined();
    expect(logger).toBeDefined();
    expect(socketGateway).toBeDefined();
  });

  describe('login', () => {
    const loginDto: GuestLoginReqDto = {
      name: 'Test Guest',
      tableNumber: 1,
      token: 'valid-token',
    };

    it('should login successfully', async () => {
      jest.spyOn(tableService, 'getTableByToken').mockResolvedValue(mockTable);
      jest.spyOn(prismaService.guest, 'create').mockResolvedValue(mockGuest);
      jest
        .spyOn(authService, 'generateGuestTokens')
        .mockResolvedValue(mockAuthResponse);
      jest.spyOn(prismaService.guest, 'update').mockResolvedValue({
        ...mockGuest,
        ...mockAuthResponse.refreshToken,
      });

      const result = await service.login(loginDto);

      expect(result).toEqual({
        guest: {
          id: mockGuest.id,
          name: mockGuest.name,
          role: Role.Guest,
          tableNumber: mockGuest.tableNumber,
          createdAt: mockGuest.createdAt,
          updatedAt: mockGuest.updatedAt,
        },
        accessToken: mockAuthResponse.accessToken,
        refreshToken: mockAuthResponse.refreshToken.refreshToken,
      });

      expect(tableService.getTableByToken).toHaveBeenCalledWith(
        loginDto.tableNumber,
        loginDto.token,
      );
      expect(prismaService.guest.create).toHaveBeenCalledWith({
        data: {
          name: loginDto.name,
          tableNumber: loginDto.tableNumber,
        },
      });
      expect(authService.generateGuestTokens).toHaveBeenCalledWith(
        mockGuest.id,
      );
      expect(prismaService.guest.update).toHaveBeenCalledWith({
        where: { id: mockGuest.id },
        data: mockAuthResponse.refreshToken,
      });
    });

    it('should throw BadRequestException when table token is invalid', async () => {
      jest.spyOn(tableService, 'getTableByToken').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when table is hidden', async () => {
      jest.spyOn(tableService, 'getTableByToken').mockResolvedValue({
        ...mockTable,
        status: TableStatus.Hidden,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when table is reserved', async () => {
      jest.spyOn(tableService, 'getTableByToken').mockResolvedValue({
        ...mockTable,
        status: TableStatus.Reserved,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when guest creation fails', async () => {
      jest.spyOn(tableService, 'getTableByToken').mockResolvedValue(mockTable);
      jest.spyOn(prismaService.guest, 'create').mockRejectedValue(new Error());

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    const guestId = 1;

    it('should logout successfully', async () => {
      jest.spyOn(prismaService.guest, 'update').mockResolvedValue({
        ...mockGuest,
        refreshToken: null,
        refreshTokenExpiresAt: null,
      });

      await service.logout(guestId);

      expect(prismaService.guest.update).toHaveBeenCalledWith({
        where: { id: guestId },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
    });

    it('should throw UnprocessableEntityException when guest not found', async () => {
      jest.spyOn(prismaService.guest, 'update').mockRejectedValue({
        code: PrismaErrorCode.RecordNotFound,
      });

      await expect(service.logout(guestId)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(prismaService.guest, 'update').mockRejectedValue(new Error());

      await expect(service.logout(guestId)).rejects.toThrow();
    });
  });

  describe('processNewGuestToken', () => {
    const refreshToken = 'valid-refresh-token';
    const mockResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should process new guest token successfully', async () => {
      jest
        .spyOn(authService, 'processNewGuestToken')
        .mockResolvedValue(mockResponse);

      const result = await service.processNewGuestToken(refreshToken);

      expect(result).toEqual(mockResponse);
      expect(authService.processNewGuestToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });

    it('should throw error when token processing fails', async () => {
      jest
        .spyOn(authService, 'processNewGuestToken')
        .mockRejectedValue(new Error());

      await expect(
        service.processNewGuestToken(refreshToken),
      ).rejects.toThrow();
    });
  });

  describe('getListOrder', () => {
    it('should get list of orders successfully', async () => {
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockResolvedValue([mockOrder]);

      const result = await service.getListOrder(1);

      expect(result).toEqual([mockOrder]);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          guestId: 1,
        },
        include: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
        },
      });
    });

    it('should throw error when fetching orders fails', async () => {
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockRejectedValue(new Error());

      await expect(service.getListOrder(1)).rejects.toThrow();
    });
  });

  describe('createDish', () => {
    const createDishDto: GuestCreateDishReqDto[] = [
      {
        quantity: 2,
        dishId: 1,
      },
    ];

    it('should create order successfully', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.dish, 'findUnique').mockResolvedValue(mockDish);
      jest.spyOn(prismaService.dishSnapshot, 'create').mockResolvedValue({
        ...mockDish,
        id: 2,
      });
      jest.spyOn(prismaService.order, 'create').mockResolvedValue(mockOrder);

      const result = await service.createDish(1, createDishDto);

      expect(result).toEqual([mockOrder]);
      expect(prismaService.guest.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: {
          refreshToken: true,
          refreshTokenExpiresAt: true,
        },
      });
      expect(prismaService.table.findUnique).toHaveBeenCalledWith({
        where: { number: mockGuest.tableNumber },
      });
      expect(prismaService.dish.findUnique).toHaveBeenCalledWith({
        where: { id: createDishDto[0].dishId },
      });
      expect(prismaService.dishSnapshot.create).toHaveBeenCalled();
      expect(prismaService.order.create).toHaveBeenCalled();
      expect(socketGateway.server.to).toHaveBeenCalled();
    });

    it('should throw BadRequestException when table is deleted', async () => {
      jest.spyOn(prismaService.guest, 'findUnique').mockResolvedValue({
        ...mockGuest,
        tableNumber: null,
      });

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when table is hidden', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest.spyOn(prismaService.table, 'findUnique').mockResolvedValue({
        ...mockTable,
        status: TableStatus.Hidden,
      });

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when table is reserved', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest.spyOn(prismaService.table, 'findUnique').mockResolvedValue({
        ...mockTable,
        status: TableStatus.Reserved,
      });

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when dish is not found', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.dish, 'findUnique').mockResolvedValue(null);

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when dish is unavailable', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.dish, 'findUnique').mockResolvedValue({
        ...mockDish,
        status: DishStatus.Unavailable,
      });

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when dish is hidden', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.dish, 'findUnique').mockResolvedValue({
        ...mockDish,
        status: DishStatus.Hidden,
      });

      await expect(service.createDish(1, createDishDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when transaction fails', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockGuest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.dish, 'findUnique').mockResolvedValue(mockDish);
      jest
        .spyOn(prismaService.dishSnapshot, 'create')
        .mockRejectedValue(new Error());

      await expect(service.createDish(1, createDishDto)).rejects.toThrow();
    });
  });

  describe('getGuestList', () => {
    const paginationDto: PaginationTimeReqDto = {
      page: 1,
      limit: 10,
      fromDate: new Date(),
      toDate: new Date(),
    };

    it('should get guest list successfully', async () => {
      const guests = [mockGuest];
      jest.spyOn(prismaService.guest, 'findMany').mockResolvedValue(guests);

      const result = await service.getGuestList(paginationDto);

      expect(result).toEqual({
        guests,
        meta: {
          total: guests.length,
          page: paginationDto.page,
          limit: paginationDto.limit,
        },
      });
      expect(prismaService.guest.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          createdAt: {
            gte: paginationDto.fromDate,
            lte: paginationDto.toDate,
          },
        },
        omit: {
          refreshToken: true,
          refreshTokenExpiresAt: true,
        },
      });
    });

    it('should use default pagination values when not provided', async () => {
      const guests = [mockGuest];
      jest.spyOn(prismaService.guest, 'findMany').mockResolvedValue(guests);

      const result = await service.getGuestList({});

      expect(result).toEqual({
        guests,
        meta: {
          total: guests.length,
          page: 1,
          limit: 12,
        },
      });
      expect(prismaService.guest.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 12,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          createdAt: {
            gte: undefined,
            lte: undefined,
          },
        },
        omit: {
          refreshToken: true,
          refreshTokenExpiresAt: true,
        },
      });
    });

    it('should throw error when fetching guests fails', async () => {
      jest
        .spyOn(prismaService.guest, 'findMany')
        .mockRejectedValue(new Error());

      await expect(service.getGuestList(paginationDto)).rejects.toThrow();
    });
  });

  describe('createGuest', () => {
    const createGuestDto: CreateGuestReqDto = {
      name: 'New Guest',
      tableNumber: 1,
    };

    it('should create guest successfully', async () => {
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.guest, 'create').mockResolvedValue(mockGuest);

      const result = await service.createGuest(createGuestDto);

      expect(result).toEqual(mockGuest);
      expect(prismaService.table.findUnique).toHaveBeenCalledWith({
        where: { number: createGuestDto.tableNumber },
      });
      expect(prismaService.guest.create).toHaveBeenCalledWith({
        data: createGuestDto,
      });
    });

    it('should throw BadRequestException when table not found', async () => {
      jest.spyOn(prismaService.table, 'findUnique').mockResolvedValue(null);

      await expect(service.createGuest(createGuestDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when table is hidden', async () => {
      jest.spyOn(prismaService.table, 'findUnique').mockResolvedValue({
        ...mockTable,
        status: TableStatus.Hidden,
      });

      await expect(service.createGuest(createGuestDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when guest creation fails', async () => {
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockTable);
      jest.spyOn(prismaService.guest, 'create').mockRejectedValue(new Error());

      await expect(service.createGuest(createGuestDto)).rejects.toThrow();
    });
  });
});
