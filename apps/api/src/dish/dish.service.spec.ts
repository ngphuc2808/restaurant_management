import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DishService } from './dish.service';
import { PrismaService } from '@/prisma.service';
import { CreateDishReqDto } from './dto/req/create.req.dto';
import { UpdateDishReqDto } from './dto/req/update.req.dto';
import { PrismaErrorCode } from '@/utils/errors';
import { Prisma } from '@prisma/client';

jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('DishService', () => {
  let service: DishService;
  let prisma: PrismaService;

  const mockPrismaService = {
    dish: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
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
      providers: [
        DishService,
        Logger,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetail', () => {
    it('should get dish detail successfully', async () => {
      mockPrismaService.dish.findUnique.mockResolvedValue(mockDish);

      const result = await service.getDetail(1);

      expect(result).toEqual(mockDish);
      expect(prisma.dish.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw UnprocessableEntityException when dish not found', async () => {
      mockPrismaService.dish.findUnique.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: PrismaErrorCode.RecordNotFound,
          clientVersion: '5.0.0',
        }),
      );
      mockI18nService.t.mockReturnValue('No dish found');

      await expect(service.getDetail(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getList', () => {
    it('should get dish list successfully', async () => {
      const paginationDto = { page: 1, limit: 12 };
      mockPrismaService.dish.findMany.mockResolvedValue([mockDish]);
      mockPrismaService.dish.count.mockResolvedValue(1);

      const result = await service.getList(paginationDto);

      expect(result).toEqual({
        dishes: [mockDish],
        meta: {
          total: 1,
          page: 1,
          limit: 12,
          totalPages: 1,
        },
      });
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

      mockPrismaService.dish.create.mockResolvedValue(mockDish);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDish);
      expect(prisma.dish.create).toHaveBeenCalledWith({
        data: createDto,
      });
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

      mockPrismaService.dish.update.mockResolvedValue({
        ...mockDish,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ ...mockDish, ...updateDto });
      expect(prisma.dish.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw UnprocessableEntityException when dish not found', async () => {
      const updateDto: UpdateDishReqDto = {
        name: 'Updated Dish',
        price: 150,
        description: 'Updated Description',
        image: 'updated-image.jpg',
        status: 'Available',
      };

      mockPrismaService.dish.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: PrismaErrorCode.RecordNotFound,
          clientVersion: '5.0.0',
        }),
      );
      mockI18nService.t.mockReturnValue('No dish found');

      await expect(service.update(1, updateDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('delete', () => {
    it('should delete dish successfully', async () => {
      mockPrismaService.dish.delete.mockResolvedValue(mockDish);

      const result = await service.delete(1);

      expect(result).toEqual(mockDish);
      expect(prisma.dish.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw UnprocessableEntityException when dish not found', async () => {
      mockPrismaService.dish.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: PrismaErrorCode.RecordNotFound,
          clientVersion: '5.0.0',
        }),
      );
      mockI18nService.t.mockReturnValue('No dish found');

      await expect(service.delete(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
