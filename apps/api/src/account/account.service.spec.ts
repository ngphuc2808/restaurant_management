import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

import { Account } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';
import { AccountService } from '@/account/account.service';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { PrismaErrorCode } from '@/utils/errors';
import { Role } from '@/constants/type';

jest.mock('bcryptjs');
jest.mock('@/utils/errors', () => ({
  ...jest.requireActual('@/utils/errors'),
  isPrismaClientKnownRequestError: jest.fn().mockImplementation(() => true),
}));

describe('AccountService', () => {
  let service: AccountService;
  let prismaService: PrismaService;
  let authService: AuthService;
  let refreshTokenService: RefreshTokenService;
  let socketService: SocketService;
  let socketGateway: SocketGateway;
  let i18nService: I18nService;

  const mockAccount: Account = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: Role.Employee,
    avatar: 'avatar.jpg',
    ownerId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    account: {
      id: mockAccount.id,
      email: mockAccount.email,
      role: mockAccount.role,
      avatar: mockAccount.avatar,
      name: mockAccount.name,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
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
            account: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateTokens: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            invalidateAll: jest.fn(),
          },
        },
        {
          provide: SocketService,
          useValue: {
            findOneWithAccountId: jest.fn(),
          },
        },
        {
          provide: SocketGateway,
          useValue: {
            server: {
              to: jest.fn().mockReturnThis(),
              emit: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    socketService = module.get<SocketService>(SocketService);
    socketGateway = module.get<SocketGateway>(SocketGateway);
    i18nService = module.get<I18nService>(I18nService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(authService).toBeDefined();
    expect(refreshTokenService).toBeDefined();
    expect(socketService).toBeDefined();
    expect(socketGateway).toBeDefined();
    expect(i18nService).toBeDefined();
  });

  describe('me', () => {
    it('should return account details without password', async () => {
      const accountWithoutPassword = { ...mockAccount };
      delete accountWithoutPassword.password;
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(accountWithoutPassword);

      const result = await service.me(1);

      expect(result).toEqual(accountWithoutPassword);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: {
          password: true,
        },
      });
    });

    it('should throw error when account not found', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockRejectedValue(new Error());

      await expect(service.me(1)).rejects.toThrow();
    });
  });

  describe('updateMe', () => {
    const updateDto: UpdateMeReqDto = {
      name: 'Updated Name',
      avatar: 'new-avatar.jpg',
    };

    it('should update account successfully', async () => {
      const updatedAccount = { ...mockAccount, ...updateDto };
      delete updatedAccount.password;
      jest
        .spyOn(prismaService.account, 'update')
        .mockResolvedValue(updatedAccount);

      const result = await service.updateMe(1, updateDto);

      expect(result).toEqual(updatedAccount);
      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        omit: {
          password: true,
        },
      });
    });

    it('should throw error when update fails', async () => {
      jest
        .spyOn(prismaService.account, 'update')
        .mockRejectedValue(new Error());

      await expect(service.updateMe(1, updateDto)).rejects.toThrow();
    });
  });

  describe('updatePassword', () => {
    const changePasswordDto: ChangePasswordReqDto = {
      oldPassword: 'oldPassword',
      password: 'newPassword',
      confirmPassword: 'newPassword',
    };

    it('should update password successfully', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      jest.spyOn(prismaService.account, 'update').mockResolvedValue({
        ...mockAccount,
        password: 'newHashedPassword',
      });
      jest
        .spyOn(refreshTokenService, 'invalidateAll')
        .mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue(mockAuthResponse);

      const result = await service.updatePassword(1, changePasswordDto);

      expect(result).toEqual(mockAuthResponse);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.oldPassword,
        mockAccount.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.password, 10);
      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newHashedPassword' },
      });
      expect(refreshTokenService.invalidateAll).toHaveBeenCalledWith(1);
      expect(authService.generateTokens).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when old password is invalid', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(1, changePasswordDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('getAccountList', () => {
    const paginationDto: PaginationReqDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated account list', async () => {
      const accounts = [mockAccount].map((account) => {
        const accountWithoutPassword = { ...account };
        delete accountWithoutPassword.password;
        return accountWithoutPassword;
      });
      jest.spyOn(prismaService.account, 'findMany').mockResolvedValue(accounts);
      jest.spyOn(prismaService.account, 'count').mockResolvedValue(1);

      const result = await service.getAccountList(paginationDto);

      expect(result).toEqual({
        accounts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prismaService.account.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        omit: {
          password: true,
        },
      });
      expect(prismaService.account.count).toHaveBeenCalled();
    });

    it('should use default pagination values when not provided', async () => {
      const accounts = [mockAccount];
      jest.spyOn(prismaService.account, 'findMany').mockResolvedValue(accounts);
      jest.spyOn(prismaService.account, 'count').mockResolvedValue(1);

      const result = await service.getAccountList({});

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      });
    });
  });

  describe('create', () => {
    const createDto: CreateAccountReqDto = {
      email: 'new@example.com',
      password: 'password',
      name: 'New User',
      avatar: 'avatar.jpg',
      confirmPassword: 'password',
    };

    it('should create account successfully', async () => {
      const accountWithoutPassword = { ...mockAccount };
      delete accountWithoutPassword.password;
      jest.spyOn(prismaService.account, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest
        .spyOn(prismaService.account, 'create')
        .mockResolvedValue(accountWithoutPassword);

      const result = await service.create(1, createDto);

      expect(result).toEqual(accountWithoutPassword);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(prismaService.account.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          email: createDto.email,
          password: 'hashedPassword',
          avatar: createDto.avatar,
          role: Role.Employee,
          ownerId: 1,
        },
        omit: {
          password: true,
        },
      });
    });

    it('should throw UnprocessableEntityException when email already exists', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);

      await expect(service.create(1, createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      jest.spyOn(socketService, 'findOneWithAccountId').mockResolvedValue({
        guestId: 1,
        accountId: 1,
        socketId: 'socket-id',
      });
      jest
        .spyOn(prismaService.account, 'delete')
        .mockResolvedValue(mockAccount);

      const result = await service.deleteAccount(1);

      expect(result).toEqual(mockAccount);
      expect(socketService.findOneWithAccountId).toHaveBeenCalledWith(1);
      expect(prismaService.account.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(socketGateway.server.to).toHaveBeenCalledWith('socket-id');
      expect(socketGateway.server.emit).toHaveBeenCalledWith(
        'logout',
        mockAccount,
      );
    });

    it('should throw UnprocessableEntityException when account not found', async () => {
      jest.spyOn(prismaService.account, 'delete').mockRejectedValue({
        code: PrismaErrorCode.RecordNotFound,
      });

      await expect(service.deleteAccount(1)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('updateAccount', () => {
    const updateDto: UpdateAccountReqDto = {
      email: 'updated@example.com',
      name: 'Updated Name',
      avatar: 'new-avatar.jpg',
      role: Role.Employee,
      changePassword: false,
      password: 'newPassword',
      confirmPassword: 'newPassword',
    };

    it('should update account successfully', async () => {
      const updatedAccount = { ...mockAccount, ...updateDto };
      delete updatedAccount.password;
      jest
        .spyOn(socketService, 'findOneWithAccountId')
        .mockResolvedValue({ guestId: 1, accountId: 1, socketId: 'socket-1' });
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      jest
        .spyOn(prismaService.account, 'update')
        .mockResolvedValue(updatedAccount);

      const result = await service.updateAccount(1, 1, updateDto);

      expect(result).toEqual(updatedAccount);
      expect(socketService.findOneWithAccountId).toHaveBeenCalledWith(1);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: updateDto.name,
          avatar: updateDto.avatar,
          role: updateDto.role,
          email: updateDto.email,
          ownerId: 1,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should update account with password change', async () => {
      const updateDtoWithPassword = {
        ...updateDto,
        changePassword: true,
      };
      const updatedAccount = { ...mockAccount, ...updateDtoWithPassword };
      delete updatedAccount.password;
      jest
        .spyOn(socketService, 'findOneWithAccountId')
        .mockResolvedValue({ guestId: 1, accountId: 1, socketId: 'socket-1' });
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(mockAccount);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      jest
        .spyOn(prismaService.account, 'update')
        .mockResolvedValue(updatedAccount);

      const result = await service.updateAccount(1, 1, updateDtoWithPassword);

      expect(result).toEqual(updatedAccount);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        updateDtoWithPassword.password,
        10,
      );
      expect(prismaService.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: updateDtoWithPassword.name,
          avatar: updateDtoWithPassword.avatar,
          role: updateDtoWithPassword.role,
          email: updateDtoWithPassword.email,
          ownerId: 1,
          password: 'newHashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw UnprocessableEntityException when account not found', async () => {
      jest.spyOn(prismaService.account, 'findUnique').mockResolvedValue(null);

      await expect(service.updateAccount(1, 1, updateDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('getAccountDetail', () => {
    it('should return account details', async () => {
      const accountWithoutPassword = { ...mockAccount };
      delete accountWithoutPassword.password;
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockResolvedValue(accountWithoutPassword);

      const result = await service.getAccountDetail(1);

      expect(result).toEqual(accountWithoutPassword);
      expect(prismaService.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        omit: {
          password: true,
        },
      });
    });

    it('should throw error when account not found', async () => {
      jest
        .spyOn(prismaService.account, 'findUnique')
        .mockRejectedValue(new Error());

      await expect(service.getAccountDetail(1)).rejects.toThrow();
    });
  });
});
