import { Test, TestingModule } from '@nestjs/testing';
import {
  Logger,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { TableService } from '@/table/table.service';
import { GuestService } from '@/guest/guest.service';
import { GuestLoginReqDto } from '@/guest/dto/req/guest-login.req.dto';
import { GuestLogoutReqDto } from '@/guest/dto/req/guest-logout.req.dto';
import { Role, TableStatus } from '@/constants/type';
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
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateGuestTokens: jest.fn(),
          },
        },
        {
          provide: TableService,
          useValue: {
            getTableByToken: jest.fn(),
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(authService).toBeDefined();
    expect(tableService).toBeDefined();
    expect(i18nService).toBeDefined();
    expect(logger).toBeDefined();
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
    const logoutDto: GuestLogoutReqDto = {
      id: 1,
    };

    it('should logout successfully', async () => {
      jest.spyOn(prismaService.guest, 'update').mockResolvedValue({
        ...mockGuest,
        refreshToken: null,
        refreshTokenExpiresAt: null,
      });

      await service.logout(logoutDto.id);

      expect(prismaService.guest.update).toHaveBeenCalledWith({
        where: { id: logoutDto.id },
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

      await expect(service.logout(logoutDto.id)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(prismaService.guest, 'update').mockRejectedValue(new Error());

      await expect(service.logout(logoutDto.id)).rejects.toThrow();
    });
  });
});
