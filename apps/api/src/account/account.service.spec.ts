import { I18nService } from 'nestjs-i18n';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { AccountService } from '@/account/account.service';
import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { Role } from '@/constants/type';

describe('AccountService', () => {
  let service: AccountService;
  let prisma: PrismaService;
  let authService: AuthService;
  let refreshTokenService: RefreshTokenService;
  let socketService: SocketService;
  let socketGateway: SocketGateway;
  let i18n: I18nService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: {
            account: {
              findUniqueOrThrow: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            findAccountWithEmail: jest.fn(),
          },
        },
        { provide: RefreshTokenService, useValue: {} },
        {
          provide: SocketService,
          useValue: {
            findOneWithAccountId: jest.fn(),
          },
        },
        { provide: SocketGateway, useValue: {} },
        { provide: I18nService, useValue: { t: jest.fn() } },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    socketService = module.get<SocketService>(SocketService);
    socketGateway = module.get<SocketGateway>(SocketGateway);
    i18n = module.get<I18nService>(I18nService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('me', () => {
    it('should return account details', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        avatar: 'avatar-url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(prisma.account, 'findUniqueOrThrow')
        .mockResolvedValue(mockAccount);
      await expect(service.me(1)).resolves.toEqual(mockAccount);
    });
  });

  describe('updateMe', () => {
    it('should update account details', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        avatar: 'avatar-url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.account, 'update').mockResolvedValue(mockAccount);
      await expect(
        service.updateMe(1, { name: 'Updated User', avatar: '' }),
      ).resolves.toEqual(mockAccount);
    });
  });

  describe('updatePassword', () => {
    it('should throw an error if old password is incorrect', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        avatar: 'avatar-url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.account, 'findUniqueOrThrow')
        .mockResolvedValue(mockAccount);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      i18n.t = jest.fn().mockReturnValue('Old password is incorrect');
      await expect(
        service.updatePassword(1, {
          oldPassword: 'wrong',
          password: 'newpass123',
          confirmPassword: 'newpass123',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('getAccountList', () => {
    it('should return paginated account list', async () => {
      const mockAccounts = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
          avatar: 'avatar-url',
          role: Role.Employee,
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prisma.account, 'findMany').mockResolvedValue(mockAccounts);
      jest.spyOn(prisma.account, 'count').mockResolvedValue(1);
      await expect(
        service.getAccountList({ page: 1, limit: 10 }),
      ).resolves.toEqual({
        accounts: mockAccounts,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        avatar: 'avatar_url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.account, 'findUnique').mockResolvedValue(mockAccount);
      jest.spyOn(prisma.account, 'delete').mockResolvedValue(mockAccount);

      await expect(service.deleteAccount(1)).resolves.toEqual(mockAccount);
    });
  });

  describe('updateAccount', () => {
    it('should update an account', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        avatar: 'avatar_url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateData = {
        name: 'Updated User',
        role: Role.Owner,
        avatar: '',
        email: 'test@example.com',
        changePassword: false,
        password: '123123',
        confirmPassword: '123123',
      };

      jest.spyOn(prisma.account, 'findUnique').mockResolvedValue(mockAccount);
      jest
        .spyOn(prisma.account, 'update')
        .mockResolvedValue({ ...mockAccount, ...updateData });

      await expect(service.updateAccount(1, updateData)).resolves.toEqual({
        ...mockAccount,
        ...updateData,
      });
    });
  });

  describe('getAccountDetail', () => {
    it('should return account details', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        avatar: 'avatar-url',
        role: Role.Employee,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.account, 'findUniqueOrThrow')
        .mockResolvedValue(mockAccount);
      await expect(service.getAccountDetail(1)).resolves.toEqual(mockAccount);
    });
  });
});
