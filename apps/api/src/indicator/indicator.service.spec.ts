import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/prisma.service';
import { IndicatorService } from '@/indicator/indicator.service';
import { TimeReqDto } from '@/utils/time.dto';
import { OrderStatus, DishStatus } from '@/constants/type';

describe('IndicatorService', () => {
  let service: IndicatorService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockTimeDto: TimeReqDto = {
    fromDate: new Date('2024-03-28'),
    toDate: new Date('2024-03-28'),
  };

  const mockOrders = [
    {
      id: 1,
      guestId: 1,
      tableNumber: 1,
      dishSnapshotId: 1,
      quantity: 2,
      orderHandlerId: 1,
      status: OrderStatus.Paid,
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28'),
      dishSnapshot: {
        id: 1,
        price: 10000,
        dishId: 1,
      },
      table: {
        number: 1,
      },
    },
    {
      id: 2,
      guestId: 1,
      tableNumber: 2,
      dishSnapshotId: 2,
      quantity: 1,
      orderHandlerId: 1,
      status: OrderStatus.Processing,
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28'),
      dishSnapshot: {
        id: 2,
        price: 20000,
        dishId: 2,
      },
      table: {
        number: 2,
      },
    },
  ];

  const mockGuests = [
    {
      id: 1,
      name: 'Test Guest',
      tableNumber: 1,
      createdAt: new Date('2024-03-28'),
      updatedAt: new Date('2024-03-28'),
      refreshToken: 'test-refresh-token',
      refreshTokenExpiresAt: new Date('2024-03-29'),
    },
  ];

  const mockDishes = [
    {
      id: 1,
      name: 'Test Dish 1',
      price: 10000,
      description: 'Test Description 1',
      image: '',
      status: DishStatus.Available,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Test Dish 2',
      price: 20000,
      description: 'Test Description 2',
      image: '',
      status: DishStatus.Available,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicatorService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
            },
            guest: {
              findMany: jest.fn(),
            },
            dish: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('Asia/Ho_Chi_Minh'),
          },
        },
      ],
    }).compile();

    service = module.get<IndicatorService>(IndicatorService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('getIndicators', () => {
    it('should return correct indicators data', async () => {
      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(mockOrders);
      jest.spyOn(prismaService.guest, 'findMany').mockResolvedValue(mockGuests);
      jest.spyOn(prismaService.dish, 'findMany').mockResolvedValue(mockDishes);

      const result = await service.getIndicators(mockTimeDto);

      expect(result).toEqual({
        revenue: 20000, // 10000 * 2 (from paid order)
        guestCount: 1,
        orderCount: 2,
        servingTableCount: 1, // Only one table with active orders
        dishIndicator: [
          {
            ...mockDishes[0],
            successOrders: 1, // From paid order
          },
          {
            ...mockDishes[1],
            successOrders: 0,
          },
        ],
        revenueByDate: [
          {
            date: '28/03/2024',
            revenue: 20000,
          },
        ],
      });

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        include: {
          dishSnapshot: true,
          table: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          createdAt: {
            gte: mockTimeDto.fromDate,
            lte: mockTimeDto.toDate,
          },
        },
      });

      expect(prismaService.guest.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: mockTimeDto.fromDate,
            lte: mockTimeDto.toDate,
          },
          orders: {
            some: {
              status: OrderStatus.Paid,
            },
          },
        },
      });

      expect(prismaService.dish.findMany).toHaveBeenCalled();
    });

    it('should handle empty data', async () => {
      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.guest, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.dish, 'findMany').mockResolvedValue([]);

      const result = await service.getIndicators(mockTimeDto);

      expect(result).toEqual({
        revenue: 0,
        guestCount: 0,
        orderCount: 0,
        servingTableCount: 0,
        dishIndicator: [],
        revenueByDate: [],
      });
    });

    it('should throw error when database query fails', async () => {
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockRejectedValue(new Error());

      await expect(service.getIndicators(mockTimeDto)).rejects.toThrow();
    });
  });
});
