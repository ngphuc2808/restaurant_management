import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let prismaService: PrismaService;

  const mockRefreshToken = {
    id: 1,
    token: 'mock-refresh-token',
    accountId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('insert', () => {
    it('should create a refresh token successfully', async () => {
      const createSpy = jest
        .spyOn(prismaService.refreshToken, 'create')
        .mockResolvedValue(mockRefreshToken);

      const result = await service.insert(
        mockRefreshToken.accountId,
        mockRefreshToken.token,
        mockRefreshToken.expiresAt,
      );

      expect(result).toEqual(mockRefreshToken.token);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          accountId: mockRefreshToken.accountId,
          token: mockRefreshToken.token,
          expiresAt: mockRefreshToken.expiresAt,
        },
      });
    });

    it('should throw error when creation fails', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'create')
        .mockRejectedValue(new Error('Failed to create token'));

      await expect(
        service.insert(
          mockRefreshToken.accountId,
          mockRefreshToken.token,
          mockRefreshToken.expiresAt,
        ),
      ).rejects.toThrow('Failed to create token');
    });
  });

  describe('validate', () => {
    it('should validate a valid refresh token', async () => {
      const findSpy = jest
        .spyOn(prismaService.refreshToken, 'findUnique')
        .mockResolvedValue(mockRefreshToken);

      const result = await service.validate(
        mockRefreshToken.accountId,
        mockRefreshToken.token,
      );

      expect(result).toBe(true);
      expect(findSpy).toHaveBeenCalledWith({
        where: { token: mockRefreshToken.token },
      });
    });

    it('should return false when token is invalid', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.validate(
        mockRefreshToken.accountId,
        'invalid-token',
      );

      expect(result).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should delete a refresh token successfully', async () => {
      const deleteSpy = jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockResolvedValue(mockRefreshToken);

      await service.invalidate(mockRefreshToken.token);

      expect(deleteSpy).toHaveBeenCalledWith({
        where: {
          token: mockRefreshToken.token,
        },
      });
    });

    it('should throw error when deletion fails', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockRejectedValue(new Error('Failed to delete token'));

      await expect(service.invalidate(mockRefreshToken.token)).rejects.toThrow(
        'Failed to delete token',
      );
    });
  });

  describe('invalidateAll', () => {
    it('should invalidate all refresh tokens for an account', async () => {
      const deleteSpy = jest
        .spyOn(prismaService.refreshToken, 'deleteMany')
        .mockResolvedValue({ count: 2 });

      await service.invalidateAll(mockRefreshToken.accountId);

      expect(deleteSpy).toHaveBeenCalledWith({
        where: {
          accountId: mockRefreshToken.accountId,
        },
      });
    });

    it('should throw error when invalidation fails', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'deleteMany')
        .mockRejectedValue(new Error('Failed to invalidate tokens'));

      await expect(
        service.invalidateAll(mockRefreshToken.accountId),
      ).rejects.toThrow('Failed to invalidate tokens');
    });
  });
});
