import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';

import { TableController } from '@/table/table.controller';
import { TableService } from '@/table/table.service';
import { CreateTableReqDto } from '@/table/dto/req/create.req.dto';
import { UpdateTableReqDto } from '@/table/dto/req/update.req.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';
import { TableStatus } from '@/constants/type';

describe('TableController', () => {
  let controller: TableController;
  let service: TableService;

  const mockTableService = {
    getDetail: jest.fn(),
    getTableList: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  const mockTable = {
    id: 1,
    number: 1,
    capacity: 4,
    status: TableStatus.Available,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [
        {
          provide: TableService,
          useValue: mockTableService,
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

    controller = module.get<TableController>(TableController);
    service = module.get<TableService>(TableService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDetail', () => {
    it('should get table detail successfully', async () => {
      mockTableService.getDetail.mockResolvedValue(mockTable);

      const result = await controller.getDetail('1');

      expect(result).toEqual(mockTable);
      expect(service.getDetail).toHaveBeenCalledWith(1);
    });
  });

  describe('getAccountList', () => {
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

      mockTableService.getTableList.mockResolvedValue(mockResponse);

      const result = await controller.getAccountList(paginationDto);

      expect(result).toEqual(mockResponse);
      expect(service.getTableList).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('create', () => {
    it('should create table successfully', async () => {
      const createDto: CreateTableReqDto = {
        number: 1,
        capacity: 4,
        status: TableStatus.Available,
      };

      mockTableService.create.mockResolvedValue(mockTable);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTable);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update table successfully', async () => {
      const updateDto: UpdateTableReqDto = {
        capacity: 6,
        status: TableStatus.Reserved,
        changeToken: true,
      };

      mockTableService.update.mockResolvedValue({ ...mockTable, ...updateDto });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({ ...mockTable, ...updateDto });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete table successfully', async () => {
      mockTableService.delete.mockResolvedValue(mockTable);

      const result = await controller.delete('1');

      expect(result).toEqual(mockTable);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
