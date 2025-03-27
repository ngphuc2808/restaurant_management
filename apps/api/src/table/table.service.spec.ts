import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TableService } from './table.service';
import { PrismaService } from '@/prisma.service';
import { CreateTableReqDto } from './dto/req/create.req.dto';
import { UpdateTableReqDto } from './dto/req/update.req.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';
import { TableStatus } from '@/constants/type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('TableService', () => {
  let service: TableService;
  let prisma: PrismaService;

  const mockPrismaService = {
    table: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    guest: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  const mockTable = {
    id: 1,
    number: 1,
    capacity: 4,
    status: TableStatus.Available,
    token: 'test-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetail', () => {
    it('should get table detail successfully', async () => {
      mockPrismaService.table.findUnique.mockResolvedValue(mockTable);

      const result = await service.getDetail(1);

      expect(result).toEqual(mockTable);
      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { number: 1 },
      });
    });

    it('should throw UnprocessableEntityException when table not found', async () => {
      const error = new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      mockPrismaService.table.findUnique.mockRejectedValue(error);

      await expect(service.getDetail(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getTableList', () => {
    it('should get table list successfully', async () => {
      const paginationDto: PaginationReqDto = { page: 1, limit: 10 };
      const mockResponse = {
        tables: [mockTable],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockPrismaService.table.findMany.mockResolvedValue([mockTable]);
      mockPrismaService.table.count.mockResolvedValue(1);

      const result = await service.getTableList(paginationDto);

      expect(result).toEqual(mockResponse);
      expect(prisma.table.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.table.count).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create table successfully', async () => {
      const createDto: CreateTableReqDto = {
        number: 1,
        capacity: 4,
        status: TableStatus.Available,
      };

      mockPrismaService.table.create.mockResolvedValue(mockTable);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTable);
      expect(prisma.table.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createDto),
      });
    });

    it('should throw UnprocessableEntityException when table already exists', async () => {
      const createDto: CreateTableReqDto = {
        number: 1,
        capacity: 4,
        status: TableStatus.Available,
      };

      const error = new PrismaClientKnownRequestError('', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      mockPrismaService.table.create.mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('update', () => {
    it('should update table successfully without changing token', async () => {
      const updateDto: UpdateTableReqDto = {
        capacity: 6,
        status: TableStatus.Reserved,
        changeToken: false,
      };

      mockPrismaService.table.update.mockResolvedValue({
        ...mockTable,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ ...mockTable, ...updateDto });
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { number: 1 },
        data: expect.objectContaining({
          status: updateDto.status,
          capacity: updateDto.capacity,
        }),
      });
    });

    it('should update table successfully with changing token', async () => {
      const updateDto: UpdateTableReqDto = {
        capacity: 6,
        status: TableStatus.Reserved,
        changeToken: true,
      };

      const updatedTable = {
        ...mockTable,
        ...updateDto,
        token: 'new-token',
      };

      const mockTransaction = {
        table: {
          update: jest.fn().mockResolvedValue(updatedTable),
        },
        guest: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const result = await callback(mockTransaction);
        return result;
      });

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTable);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTransaction.table.update).toHaveBeenCalledWith({
        where: { number: 1 },
        data: expect.objectContaining({
          status: updateDto.status,
          capacity: updateDto.capacity,
          token: expect.any(String),
        }),
      });
      expect(mockTransaction.guest.updateMany).toHaveBeenCalledWith({
        where: { tableNumber: 1 },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
    });

    it('should throw UnprocessableEntityException when table not found', async () => {
      const updateDto: UpdateTableReqDto = {
        capacity: 6,
        status: TableStatus.Reserved,
        changeToken: false,
      };

      const error = new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      mockPrismaService.table.update.mockRejectedValue(error);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('delete', () => {
    it('should delete table successfully', async () => {
      mockPrismaService.table.delete.mockResolvedValue(mockTable);

      const result = await service.delete(1);

      expect(result).toEqual(mockTable);
      expect(prisma.table.delete).toHaveBeenCalledWith({
        where: { number: 1 },
      });
    });

    it('should throw UnprocessableEntityException when table not found', async () => {
      const error = new PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      mockPrismaService.table.delete.mockRejectedValue(error);

      await expect(service.delete(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getTableByToken', () => {
    it('should get table by token successfully', async () => {
      const number = 1;
      const token = 'test-token';

      mockPrismaService.table.findUnique.mockResolvedValue(mockTable);

      const result = await service.getTableByToken(number, token);

      expect(result).toEqual(mockTable);
      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { number, token },
      });
    });

    it('should return null when table not found with token', async () => {
      const number = 1;
      const token = 'invalid-token';

      mockPrismaService.table.findUnique.mockResolvedValue(null);

      const result = await service.getTableByToken(number, token);

      expect(result).toBeNull();
      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { number, token },
      });
    });

    it('should handle database errors', async () => {
      const number = 1;
      const token = 'test-token';

      const error = new Error('Database error');
      mockPrismaService.table.findUnique.mockRejectedValue(error);

      await expect(service.getTableByToken(number, token)).rejects.toThrow(
        error,
      );
      expect(prisma.table.findUnique).toHaveBeenCalledWith({
        where: { number, token },
      });
    });
  });
});
