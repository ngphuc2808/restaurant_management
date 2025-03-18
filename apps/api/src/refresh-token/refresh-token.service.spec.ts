import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '@/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    prismaService = module.get<PrismaService>(PrismaService);
    mockPrismaService.refreshToken.delete.mockReset(); // Reset mock before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insert', () => {
    it('should call prismaService.refreshToken.create with correct data', async () => {
      const userId = 1;
      const tokenId = 'insertTokenId';
      const expiresAt = new Date();

      await service.insert(userId, tokenId, expiresAt);

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: tokenId,
          accountId: userId,
          expiresAt,
        },
      });
    });
  });

  describe('findToken', () => {
    it('should call prismaService.refreshToken.findUnique with correct token', async () => {
      const tokenId = 'findTokenId';
      const mockToken = {
        id: 1,
        token: tokenId,
        accountId: 1,
        expiresAt: new Date(),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await service.findToken(tokenId);

      expect(mockPrismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
      expect(result).toEqual(mockToken);
    });

    it('should return null if token is not found', async () => {
      const tokenId = 'findTokenNotFoundId';
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await service.findToken(tokenId);

      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    const userId = 1;
    const tokenId = 'validateTokenId';
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 1000); // Add 60 seconds
    const pastDate = new Date(now.getTime() - 60 * 1000); // Subtract 60 seconds

    it('should return false if token is not found', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await service.validate(userId, tokenId);

      expect(result).toBe(false);
      expect(mockPrismaService.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should return false if accountId does not match', async () => {
      const mockToken = {
        id: 1,
        token: tokenId,
        accountId: 2,
        expiresAt: futureDate,
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await service.validate(userId, tokenId);

      expect(result).toBe(false);
      expect(mockPrismaService.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should return true if token is valid', async () => {
      const mockToken = {
        id: 1,
        token: tokenId,
        accountId: userId,
        expiresAt: futureDate,
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await service.validate(userId, tokenId);

      expect(result).toBe(true);
      expect(mockPrismaService.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should return false and invalidate token if expired', async () => {
      const mockToken = {
        id: 1,
        token: tokenId,
        accountId: userId,
        expiresAt: pastDate,
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockToken);

      const result = await service.validate(userId, tokenId);

      expect(result).toBe(false);
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
    });
  });

  describe('invalidate', () => {
    it('should call prismaService.refreshToken.delete with correct token', async () => {
      const tokenId = 'invalidateTokenId';

      await service.invalidate(tokenId);

      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
    });
  });

  describe('removeToken', () => {
    it('should call findToken and then invalidate if token exists', async () => {
      const tokenId = 'removeTokenExistsId';
      const mockToken = {
        id: 1,
        token: tokenId,
        accountId: 1,
        expiresAt: new Date(),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockToken);

      await service.removeToken(tokenId);

      expect(mockPrismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
    });

    it('should call findToken and not invalidate if token does not exist', async () => {
      const tokenId = 'removeTokenNotExistsId';
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await service.removeToken(tokenId);

      expect(mockPrismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: tokenId },
      });
      expect(mockPrismaService.refreshToken.delete).not.toHaveBeenCalled();
    });
  });
});
