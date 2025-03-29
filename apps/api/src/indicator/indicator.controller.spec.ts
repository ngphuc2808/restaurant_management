import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

import { IndicatorController } from '@/indicator/indicator.controller';
import { IndicatorService } from '@/indicator/indicator.service';
import { TimeReqDto } from '@/utils/time.dto';
import { DishStatus } from '@/constants/type';

describe('IndicatorController', () => {
  let controller: IndicatorController;
  let service: IndicatorService;

  const mockTimeDto: TimeReqDto = {
    fromDate: new Date('2024-03-28'),
    toDate: new Date('2024-03-28'),
  };

  const mockIndicatorData = {
    revenue: 20000,
    guestCount: 1,
    orderCount: 2,
    servingTableCount: 1,
    dishIndicator: [
      {
        id: 1,
        name: 'Test Dish 1',
        price: 10000,
        description: 'Test Description 1',
        image: '',
        status: DishStatus.Available,
        createdAt: new Date(),
        updatedAt: new Date(),
        successOrders: 2,
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
        successOrders: 0,
      },
    ],
    revenueByDate: [
      {
        date: '28/03/2024',
        revenue: 20000,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicatorController],
      providers: [
        {
          provide: IndicatorService,
          useValue: {
            getIndicators: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAll: jest.fn(),
            getAllAndMerge: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IndicatorController>(IndicatorController);
    service = module.get<IndicatorService>(IndicatorService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getIndicators', () => {
    it('should return indicators data', async () => {
      jest.spyOn(service, 'getIndicators').mockResolvedValue(mockIndicatorData);

      const result = await controller.getIndicators(mockTimeDto);

      expect(result).toEqual(mockIndicatorData);
      expect(service.getIndicators).toHaveBeenCalledWith(mockTimeDto);
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(service, 'getIndicators').mockRejectedValue(new Error());

      await expect(controller.getIndicators(mockTimeDto)).rejects.toThrow();
    });
  });
});
