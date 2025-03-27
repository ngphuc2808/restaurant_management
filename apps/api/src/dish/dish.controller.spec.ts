import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';

import { DishController } from '@/dish/dish.controller';
import { DishService } from '@/dish/dish.service';
import { CreateDishReqDto } from '@/dish/dto/req/create.req.dto';
import { UpdateDishReqDto } from '@/dish/dto/req/update.req.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';

describe('DishController', () => {
  let controller: DishController;
  let service: DishService;

  const mockDishService = {
    getDetail: jest.fn(),
    getList: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  const mockDish = {
    id: 1,
    name: 'Test Dish',
    price: 100,
    description: 'Test Description',
    image: 'test-image.jpg',
    status: 'Available',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishController],
      providers: [
        {
          provide: DishService,
          useValue: mockDishService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DishController>(DishController);
    service = module.get<DishService>(DishService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDetail', () => {
    it('should get dish detail successfully', async () => {
      mockDishService.getDetail.mockResolvedValue(mockDish);

      const result = await controller.getDetail('1');

      expect(result).toEqual(mockDish);
      expect(service.getDetail).toHaveBeenCalledWith(1);
    });
  });

  describe('getList', () => {
    it('should get dish list successfully', async () => {
      const paginationDto: PaginationReqDto = { page: 1, limit: 10 };
      const mockResponse = {
        dishes: [mockDish],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockDishService.getList.mockResolvedValue(mockResponse);

      const result = await controller.getList(paginationDto);

      expect(result).toEqual(mockResponse);
      expect(service.getList).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('create', () => {
    it('should create dish successfully', async () => {
      const createDto: CreateDishReqDto = {
        name: 'Test Dish',
        price: 100,
        description: 'Test Description',
        image: 'test-image.jpg',
        status: 'Available',
      };

      mockDishService.create.mockResolvedValue(mockDish);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockDish);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update dish successfully', async () => {
      const updateDto: UpdateDishReqDto = {
        name: 'Updated Dish',
        price: 150,
        description: 'Updated Description',
        image: 'updated-image.jpg',
        status: 'Available',
      };

      mockDishService.update.mockResolvedValue({ ...mockDish, ...updateDto });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({ ...mockDish, ...updateDto });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete dish successfully', async () => {
      mockDishService.delete.mockResolvedValue(mockDish);

      const result = await controller.delete('1');

      expect(result).toEqual(mockDish);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
