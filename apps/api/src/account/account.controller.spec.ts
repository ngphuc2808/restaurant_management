import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';

import { AccountController } from '@/account/account.controller';
import { AccountService } from '@/account/account.service';
import { GuestService } from '@/guest/guest.service';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { PaginationReqDto } from '@/utils/paginate.dto';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { Role } from '@/constants/type';
import { PaginationTimeReqDto } from '@/utils/paginate-time.dto';
import { CreateGuestReqDto } from '@/guest/dto/req/create-guest.req.dto';

interface UserDto {
  id: number;
  email: string;
  role: string;
}

describe('AccountController', () => {
  let accountController: AccountController;
  let accountService: AccountService;

  const mockUser: UserDto = {
    id: 1,
    email: 'test@example.com',
    role: Role.Employee,
  };

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
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            me: jest.fn(),
            updateMe: jest.fn(),
            updatePassword: jest.fn(),
            getAccountList: jest.fn(),
            create: jest.fn(),
            deleteAccount: jest.fn(),
            updateAccount: jest.fn(),
            getAccountDetail: jest.fn(),
          },
        },
        {
          provide: GuestService,
          useValue: {
            getGuestList: jest.fn(),
            createGuest: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated text'),
          },
        },
      ],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(accountController).toBeDefined();
    expect(accountService).toBeDefined();
  });

  describe('me', () => {
    it('should return current account details', async () => {
      const accountWithoutPassword = { ...mockAccount };
      delete accountWithoutPassword.password;
      jest
        .spyOn(accountService, 'me')
        .mockResolvedValue(accountWithoutPassword);

      const result = await accountController.me(mockUser);

      expect(result).toEqual(accountWithoutPassword);
      expect(accountService.me).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(accountService, 'me').mockRejectedValue(new Error());

      await expect(accountController.me(mockUser)).rejects.toThrow();
    });
  });

  describe('updateMe', () => {
    const updateDto: UpdateMeReqDto = {
      name: 'Updated Name',
      avatar: 'new-avatar.jpg',
    };

    it('should update current account successfully', async () => {
      const updatedAccount = { ...mockAccount, ...updateDto };
      delete updatedAccount.password;
      jest.spyOn(accountService, 'updateMe').mockResolvedValue(updatedAccount);

      const result = await accountController.updateMe(mockUser, updateDto);

      expect(result).toEqual(updatedAccount);
      expect(accountService.updateMe).toHaveBeenCalledWith(
        mockUser.id,
        updateDto,
      );
    });

    it('should throw error when update fails', async () => {
      jest.spyOn(accountService, 'updateMe').mockRejectedValue(new Error());

      await expect(
        accountController.updateMe(mockUser, updateDto),
      ).rejects.toThrow();
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
        .spyOn(accountService, 'updatePassword')
        .mockResolvedValue(mockAuthResponse);

      const result = await accountController.updatePassword(
        mockUser,
        changePasswordDto,
      );

      expect(result).toEqual(mockAuthResponse);
      expect(accountService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
      );
    });

    it('should throw UnprocessableEntityException when old password is invalid', async () => {
      jest
        .spyOn(accountService, 'updatePassword')
        .mockRejectedValue(new UnprocessableEntityException());

      await expect(
        accountController.updatePassword(mockUser, changePasswordDto),
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
      const response = {
        accounts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      jest.spyOn(accountService, 'getAccountList').mockResolvedValue(response);

      const result = await accountController.getAccountList(paginationDto);

      expect(result).toEqual(response);
      expect(accountService.getAccountList).toHaveBeenCalledWith(paginationDto);
    });

    it('should throw error when service fails', async () => {
      jest
        .spyOn(accountService, 'getAccountList')
        .mockRejectedValue(new Error());

      await expect(
        accountController.getAccountList(paginationDto),
      ).rejects.toThrow();
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
      jest
        .spyOn(accountService, 'create')
        .mockResolvedValue(accountWithoutPassword);

      const result = await accountController.create(mockUser, createDto);

      expect(result).toEqual(accountWithoutPassword);
      expect(accountService.create).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
    });

    it('should throw error when service fails', async () => {
      jest.spyOn(accountService, 'create').mockRejectedValue(new Error());

      await expect(
        accountController.create(mockUser, createDto),
      ).rejects.toThrow();
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      jest
        .spyOn(accountService, 'deleteAccount')
        .mockResolvedValue(mockAccount);

      const result = await accountController.deleteAccount('1');

      expect(result).toEqual(mockAccount);
      expect(accountService.deleteAccount).toHaveBeenCalledWith(1);
    });

    it('should throw UnprocessableEntityException when account not found', async () => {
      jest
        .spyOn(accountService, 'deleteAccount')
        .mockRejectedValue(new UnprocessableEntityException());

      await expect(accountController.deleteAccount('1')).rejects.toThrow(
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
        .spyOn(accountService, 'updateAccount')
        .mockResolvedValue(updatedAccount);

      const result = await accountController.updateAccount(
        mockUser,
        '1',
        updateDto,
      );

      expect(result).toEqual(updatedAccount);
      expect(accountService.updateAccount).toHaveBeenCalledWith(
        mockUser.id,
        1,
        updateDto,
      );
    });

    it('should throw error when update fails', async () => {
      jest
        .spyOn(accountService, 'updateAccount')
        .mockRejectedValue(new Error());

      await expect(
        accountController.updateAccount(mockUser, '1', updateDto),
      ).rejects.toThrow();
    });
  });

  describe('getAccountDetail', () => {
    it('should return account details', async () => {
      const accountWithoutPassword = { ...mockAccount };
      delete accountWithoutPassword.password;
      jest
        .spyOn(accountService, 'getAccountDetail')
        .mockResolvedValue(accountWithoutPassword);

      const result = await accountController.getAccountDetail('1');

      expect(result).toEqual(accountWithoutPassword);
      expect(accountService.getAccountDetail).toHaveBeenCalledWith(1);
    });

    it('should throw error when account not found', async () => {
      jest
        .spyOn(accountService, 'getAccountDetail')
        .mockRejectedValue(new Error());

      await expect(accountController.getAccountDetail('1')).rejects.toThrow();
    });
  });

  describe('getListGuest', () => {
    const paginationDto: PaginationTimeReqDto = {
      page: 1,
      limit: 10,
      fromDate: new Date(),
      toDate: new Date(),
    };

    it('should return paginated guest list', async () => {
      const mockGuests = [
        {
          id: 1,
          name: 'Guest 1',
          tableNumber: 1,
          refreshToken: null,
          refreshTokenExpiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        guests: mockGuests,
        meta: {
          total: mockGuests.length,
          page: 1,
          limit: 10,
        },
      };

      jest
        .spyOn(accountController['guestService'], 'getGuestList')
        .mockResolvedValue(mockResponse);

      const result = await accountController.getListGuest(paginationDto);

      expect(result).toEqual(mockResponse);
      expect(
        accountController['guestService'].getGuestList,
      ).toHaveBeenCalledWith(paginationDto);
    });

    it('should throw error when service fails', async () => {
      jest
        .spyOn(accountController['guestService'], 'getGuestList')
        .mockRejectedValue(new Error());

      await expect(
        accountController.getListGuest(paginationDto),
      ).rejects.toThrow();
    });
  });

  describe('createGuest', () => {
    const createGuestDto: CreateGuestReqDto = {
      name: 'New Guest',
      tableNumber: 1,
    };

    it('should create guest successfully', async () => {
      const mockGuest = {
        id: 1,
        name: createGuestDto.name,
        tableNumber: createGuestDto.tableNumber,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(accountController['guestService'], 'createGuest')
        .mockResolvedValue(mockGuest);

      const result = await accountController.createGuest(createGuestDto);

      expect(result).toEqual(mockGuest);
      expect(
        accountController['guestService'].createGuest,
      ).toHaveBeenCalledWith(createGuestDto);
    });

    it('should throw error when service fails', async () => {
      jest
        .spyOn(accountController['guestService'], 'createGuest')
        .mockRejectedValue(new Error());

      await expect(
        accountController.createGuest(createGuestDto),
      ).rejects.toThrow();
    });
  });
});
