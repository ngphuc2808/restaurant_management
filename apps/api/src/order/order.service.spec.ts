import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaClient } from '@prisma/client';

import { OrderService } from '@/order/order.service';
import { PrismaService } from '@/prisma.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { CreateOrderReqDto } from '@/order/dto/req/create-order.req.dto';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { UpdateOrderReqDto } from '@/order/dto/req/update-order.req.dto';
import { OrderStatus, DishStatus, TableStatus } from '@/constants/type';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let socketService: SocketService;
  let socketGateway: SocketGateway;
  let i18nService: I18nService;

  const mockOrder = {
    id: 1,
    guestId: 1,
    tableNumber: 1,
    dishSnapshotId: 1,
    quantity: 1,
    orderHandlerId: null,
    status: OrderStatus.Pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    dishSnapshot: {
      id: 1,
      name: 'Test Dish',
      price: 10000,
      description: 'Test Description',
      image: '',
      status: DishStatus.Available,
      dishId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    guest: {
      id: 1,
      name: 'Test Guest',
      tableNumber: 1,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    table: {
      number: 1,
      capacity: 4,
      status: TableStatus.Available,
      token: 'test-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    orderHandler: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated text'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            guest: {
              findUnique: jest.fn(),
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
            socket: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: SocketService,
          useValue: {
            findOneWithGuestId: jest.fn(),
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

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    socketService = module.get<SocketService>(SocketService);
    socketGateway = module.get<SocketGateway>(SocketGateway);
    i18nService = module.get<I18nService>(I18nService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(socketService).toBeDefined();
    expect(socketGateway).toBeDefined();
    expect(i18nService).toBeDefined();
  });

  describe('getListOrder', () => {
    const paginationDto: PaginationTimeReqDto = {
      page: 1,
      limit: 10,
      fromDate: new Date(),
      toDate: new Date(),
    };

    it('should return paginated order list', async () => {
      const orders = [mockOrder];
      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(orders);

      const result = await service.getListOrder(paginationDto);

      expect(result).toEqual(orders);
      expect(prismaService.order.findMany).toHaveBeenCalled();
    });

    it('should throw error when database query fails', async () => {
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockRejectedValue(new Error());

      await expect(service.getListOrder(paginationDto)).rejects.toThrow();
    });
  });

  describe('getOrder', () => {
    it('should return order details', async () => {
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockResolvedValue(mockOrder);

      const result = await service.getOrder(1);

      expect(result).toEqual(mockOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          dishSnapshot: true,
          guest: true,
          table: true,
          orderHandler: true,
        },
      });
    });

    it('should throw error when order not found', async () => {
      jest
        .spyOn(prismaService.order, 'findUnique')
        .mockRejectedValue(new BadRequestException());

      await expect(service.getOrder(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createOrder', () => {
    const createDto: CreateOrderReqDto = {
      guestId: 1,
      orders: [
        {
          dishId: 1,
          quantity: 1,
        },
      ],
    };

    beforeEach(() => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue(mockOrder.guest);
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockResolvedValue(mockOrder.table);
      const mockTx = {
        dish: prismaService.dish,
        dishSnapshot: prismaService.dishSnapshot,
        order: prismaService.order,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest.spyOn(mockTx.dish, 'findUnique').mockResolvedValue({
        id: 1,
        name: 'Test Dish',
        price: 10000,
        description: 'Test Description',
        image: '',
        status: DishStatus.Available,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest
        .spyOn(mockTx.dishSnapshot, 'create')
        .mockResolvedValue(mockOrder.dishSnapshot);
      jest.spyOn(mockTx.order, 'create').mockResolvedValue(mockOrder);
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));
      jest.spyOn(socketService, 'findOneWithGuestId').mockResolvedValue({
        guestId: 1,
        socketId: 'test-socket-id',
        accountId: 1,
      });
    });

    it('should create order successfully', async () => {
      const result = await service.createOrder(1, createDto);

      expect(result).toEqual([mockOrder]);
      expect(socketGateway.server.to).toHaveBeenCalled();
      expect(socketGateway.server.emit).toHaveBeenCalled();
    });

    it('should throw error when guest not found', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockRejectedValue(new BadRequestException());

      await expect(service.createOrder(1, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when guest has no table', async () => {
      jest
        .spyOn(prismaService.guest, 'findUnique')
        .mockResolvedValue({ ...mockOrder.guest, tableNumber: null });

      await expect(service.createOrder(1, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when table not found', async () => {
      jest
        .spyOn(prismaService.table, 'findUnique')
        .mockRejectedValue(new BadRequestException());

      await expect(service.createOrder(1, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when dish not found', async () => {
      const mockTx = {
        dish: prismaService.dish,
        dishSnapshot: prismaService.dishSnapshot,
        order: prismaService.order,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest
        .spyOn(mockTx.dish, 'findUnique')
        .mockRejectedValue(new BadRequestException());
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));

      await expect(service.createOrder(1, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateOrder', () => {
    const updateDto: UpdateOrderReqDto = {
      status: OrderStatus.Processing,
      dishId: 1,
      quantity: 2,
    };

    it('should update order successfully', async () => {
      const updatedOrder = { ...mockOrder, ...updateDto };
      const mockTx = {
        order: prismaService.order,
        dish: prismaService.dish,
        dishSnapshot: prismaService.dishSnapshot,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest.spyOn(mockTx.order, 'findUnique').mockResolvedValue(mockOrder);
      jest.spyOn(mockTx.order, 'update').mockResolvedValue(updatedOrder);
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));
      jest.spyOn(socketService, 'findOneWithGuestId').mockResolvedValue({
        guestId: 1,
        socketId: 'test-socket-id',
        accountId: 1,
      });

      const result = await service.updateOrder(1, 1, updateDto);

      expect(result).toEqual(updatedOrder);
      expect(socketGateway.server.to).toHaveBeenCalled();
      expect(socketGateway.server.emit).toHaveBeenCalled();
    });

    it('should throw error when order not found', async () => {
      const mockTx = {
        order: prismaService.order,
        dish: prismaService.dish,
        dishSnapshot: prismaService.dishSnapshot,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest
        .spyOn(mockTx.order, 'findUnique')
        .mockRejectedValue(new BadRequestException());
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));

      await expect(service.updateOrder(1, 1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('payOrder', () => {
    it('should pay order successfully', async () => {
      const paidOrder = { ...mockOrder, status: OrderStatus.Paid };
      const mockTx = {
        order: prismaService.order,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest
        .spyOn(mockTx.order, 'findMany')
        .mockResolvedValueOnce([mockOrder])
        .mockResolvedValueOnce([paidOrder]);
      jest.spyOn(mockTx.order, 'updateMany').mockResolvedValue({ count: 1 });
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));
      jest.spyOn(socketService, 'findOneWithGuestId').mockResolvedValue({
        guestId: 1,
        socketId: 'test-socket-id',
        accountId: 1,
      });

      const result = await service.payOrder(1, 1);

      expect(result).toEqual([paidOrder]);
      expect(socketGateway.server.to).toHaveBeenCalled();
      expect(socketGateway.server.emit).toHaveBeenCalled();
    });

    it('should throw error when order not found', async () => {
      const mockTx = {
        order: prismaService.order,
        $executeRaw: jest.fn(),
        $executeRawUnsafe: jest.fn(),
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      } as unknown as PrismaClient;

      jest.spyOn(mockTx.order, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation((fn) => fn(mockTx));

      await expect(service.payOrder(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
