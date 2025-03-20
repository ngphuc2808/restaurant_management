import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';

import { AccountController } from '@/account/account.controller';
import { AccountService } from '@/account/account.service';
import { UpdateMeReqDto } from '@/account/dto/req/update-me.req.dto';
import { ChangePasswordReqDto } from '@/account/dto/req/change-password.req.dto';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { GetAccountListResDto } from '@/account/dto/res/get-list.res.dto';
import { AccountResDto } from '@/account/dto/res/get-detail.res.dto';
import { DeleteAccountResDto } from '@/account/dto/res/delete.res.dto';
import { PaginationReqDto } from '@/account/dto/req/paginate.req.dto';
import { UserDto } from '@/auth/dto/account.dto';
import { Role } from '@/constants/type';

describe('AccountController', () => {
  let accountController: AccountController;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            me: jest.fn().mockResolvedValue(new UserDto()),
            updateMe: jest.fn().mockResolvedValue(new AccountResDto()),
            updatePassword: jest.fn().mockResolvedValue(new AccountResDto()),
            getAccountList: jest
              .fn()
              .mockResolvedValue(new GetAccountListResDto()),
            getAccountDetail: jest.fn().mockResolvedValue(new AccountResDto()),
            create: jest.fn().mockResolvedValue(new AccountResDto()),
            updateAccount: jest.fn().mockResolvedValue(new AccountResDto()),
            deleteAccount: jest
              .fn()
              .mockResolvedValue(new DeleteAccountResDto()),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn().mockReturnValue('translated-message'),
          },
        },
      ],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(accountController).toBeDefined();
  });

  describe('me', () => {
    it('should get me', async () => {
      const userDto: UserDto = {
        id: 1,
        email: 'test@example.com',
        role: Role.Owner,
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.get',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: '',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.me as jest.Mock).mockResolvedValue(mockResData);
      const result = await accountController.me(userDto);
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.me).toHaveBeenCalledWith(userDto.id);
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('updateMe', () => {
    it('should update me', async () => {
      const userDto: UserDto = {
        id: 1,
        email: 'test@example.com',
        role: Role.Owner,
      };

      const updateMeDto: UpdateMeReqDto = {
        name: 'Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.update',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.updateMe as jest.Mock).mockResolvedValue(mockResData);
      const result = await accountController.updateMe(userDto, updateMeDto);
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.updateMe).toHaveBeenCalledWith(
        userDto.id,
        updateMeDto,
      );
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      const userDto: UserDto = {
        id: 1,
        email: 'test@example.com',
        role: Role.Owner,
      };

      const updateDto: ChangePasswordReqDto = {
        oldPassword: '123123',
        password: '123456',
        confirmPassword: '123456',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.update-password',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.updatePassword as jest.Mock).mockResolvedValue(
        mockResData,
      );
      const result = await accountController.updatePassword(userDto, updateDto);
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.updatePassword).toHaveBeenCalledWith(
        userDto.id,
        updateDto,
      );
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('getAccountList', () => {
    it('should return a paginated list of accounts', async () => {
      const mockResData: GetAccountListResDto = {
        statusCode: 200,
        message: 'res.success.account.get-list',
        data: {
          accounts: [
            {
              role: 'Employee',
              id: 1,
              name: 'Name',
              email: 'test@example.com',
              avatar: '',
              ownerId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      };

      (accountService.getAccountList as jest.Mock).mockResolvedValue(
        mockResData,
      );
      const paginationDto: PaginationReqDto = { page: 1, limit: 10 };
      const result = await accountController.getAccountList(paginationDto);
      const resultDto = Object.assign(new GetAccountListResDto(), result);
      expect(accountService.getAccountList).toHaveBeenCalledWith(paginationDto);
      expect(resultDto).toBeInstanceOf(GetAccountListResDto);
    });
  });

  describe('getAccountDetail', () => {
    it('should get account', async () => {
      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.get',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: '',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.getAccountDetail as jest.Mock).mockResolvedValue(
        mockResData,
      );
      const result = await accountController.getAccountDetail('1');
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.getAccountDetail).toHaveBeenCalledWith(1);
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createDto: CreateAccountReqDto = {
        name: 'Name',
        avatar: '',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.create',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.create as jest.Mock).mockResolvedValue(mockResData);
      const result = await accountController.create(createDto);
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.create).toHaveBeenCalledWith(createDto);
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('updateAccount', () => {
    it('should update an account', async () => {
      const updateDto: UpdateAccountReqDto = {
        name: 'Name',
        avatar: '',
        email: 'test@example.com',
        role: Role.Employee,
        changePassword: false,
        password: '',
        confirmPassword: '',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: 'res.success.account.update',
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Name',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (accountService.updateAccount as jest.Mock).mockResolvedValue(
        mockResData,
      );
      const result = await accountController.updateAccount('1', updateDto);
      const resultDto = Object.assign(new AccountResDto(), result);
      expect(accountService.updateAccount).toHaveBeenCalledWith(1, updateDto);
      expect(resultDto).toBeInstanceOf(AccountResDto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account', async () => {
      const mockResData: DeleteAccountResDto = {
        statusCode: 200,
        message: 'res.success.account.delete',
      };

      (accountService.deleteAccount as jest.Mock).mockResolvedValue(
        mockResData,
      );
      const result = await accountController.deleteAccount('1');
      const resultDto = Object.assign(new DeleteAccountResDto(), result);
      expect(accountService.deleteAccount).toHaveBeenCalledWith(1);
      expect(resultDto).toBeInstanceOf(DeleteAccountResDto);
    });
  });
});
