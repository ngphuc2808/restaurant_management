import {
  UnprocessableEntityException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

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
  let i18nService: I18nService;
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
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    i18nService = module.get<I18nService>(I18nService);
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
        message: i18nService.translate('res.success.account.get'),
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

    it('should throw an error when user is not found', async () => {
      const userDto: UserDto = {
        id: 999,
        email: 'notfound@example.com',
        role: Role.Owner,
      };

      (accountService.me as jest.Mock).mockRejectedValue(
        new NotFoundException(i18nService.translate('errors.auth.not-found')),
      );

      await expect(accountController.me(userDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(accountService.me).toHaveBeenCalledWith(userDto.id);
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
        name: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.update'),
        data: {
          role: Role.Owner,
          id: 1,
          name: 'Updated Name',
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

    it('should throw an error when update data is invalid', async () => {
      const userDto: UserDto = {
        id: 1,
        email: 'test@example.com',
        role: Role.Owner,
      };

      const invalidUpdateMeDto: UpdateMeReqDto = {
        name: '',
        avatar: 'invalid-url',
      };

      (accountService.updateMe as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException(
          i18nService.translate('errors.auth.invalid-data'),
        ),
      );

      await expect(
        accountController.updateMe(userDto, invalidUpdateMeDto),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(accountService.updateMe).toHaveBeenCalledWith(
        userDto.id,
        invalidUpdateMeDto,
      );
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
        message: i18nService.translate(
          i18nService.translate('res.success.account.update-password'),
        ),
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

    it('should throw an error when old password is incorrect', async () => {
      const userDto: UserDto = {
        id: 1,
        email: 'test@example.com',
        role: Role.Owner,
      };

      const updateDto: ChangePasswordReqDto = {
        oldPassword: 'wrong-password',
        password: '123456',
        confirmPassword: '123456',
      };

      (accountService.updatePassword as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException(
          i18nService.translate('errors.auth.invalid-old-password'),
        ),
      );

      await expect(
        accountController.updatePassword(userDto, updateDto),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(accountService.updatePassword).toHaveBeenCalledWith(
        userDto.id,
        updateDto,
      );
    });
  });

  describe('getAccountList', () => {
    it('should return a paginated list of accounts', async () => {
      const mockResData: GetAccountListResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.get-list'),
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

    it('should throw an error when page or limit is invalid', async () => {
      const invalidPaginationDto: PaginationReqDto = { page: 0, limit: 0 };

      (accountService.getAccountList as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException(
          i18nService.translate('errors.pagination.invalid'),
        ),
      );

      await expect(
        accountController.getAccountList(invalidPaginationDto),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(accountService.getAccountList).toHaveBeenCalledWith(
        invalidPaginationDto,
      );
    });
  });

  describe('getAccountDetail', () => {
    it('should get account', async () => {
      const mockResData: AccountResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.get'),
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

    it('should throw an error when account is not found', async () => {
      (accountService.getAccountDetail as jest.Mock).mockRejectedValue(
        new NotFoundException(i18nService.translate('errors.auth.not-found')),
      );

      await expect(accountController.getAccountDetail('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(accountService.getAccountDetail).toHaveBeenCalledWith(999);
    });

    it('should throw an error when account ID is invalid', async () => {
      (accountService.getAccountDetail as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException('Invalid account ID'),
      );

      await expect(accountController.getAccountDetail('999')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('create', () => {
    it('should create a new account', async () => {
      const createDto: CreateAccountReqDto = {
        name: 'Name',
        avatar: '',
        email: 'test@example.com',
        password: '123123',
        confirmPassword: '123123',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.create'),
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

    it('should throw an error when email already exists', async () => {
      (accountService.create as jest.Mock).mockRejectedValue(
        new ConflictException(
          i18nService.translate('errors.auth.email-already-exists'),
        ),
      );

      const createDto: CreateAccountReqDto = {
        name: 'Existing User',
        avatar: '',
        email: 'existing@example.com',
        password: '123123',
        confirmPassword: '123123',
      };

      await expect(accountController.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(accountService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateAccount', () => {
    it('should update an account', async () => {
      const updateDto: UpdateAccountReqDto = {
        name: 'Name',
        avatar: '',
        email: 'test@example.com',
        role: Role.Employee,
        changePassword: true,
        password: '123123',
        confirmPassword: '123123',
      };

      const mockResData: AccountResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.update'),
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

    it('should throw an error if account is not found', async () => {
      const updateDto: UpdateAccountReqDto = {
        name: 'Name',
        avatar: '',
        email: 'test@example.com',
        role: Role.Employee,
        changePassword: true,
        password: '123123',
        confirmPassword: '123123',
      };

      (accountService.updateAccount as jest.Mock).mockRejectedValue(
        new UnprocessableEntityException(
          i18nService.translate('errors.auth.no-user-found'),
        ),
      );

      await expect(
        accountController.updateAccount('1', updateDto),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(accountService.updateAccount).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete an account successfully', async () => {
      const mockResData: DeleteAccountResDto = {
        statusCode: 200,
        message: i18nService.translate('res.success.account.delete'),
      };

      (accountService.deleteAccount as jest.Mock).mockResolvedValue(
        mockResData,
      );

      const result = await accountController.deleteAccount('1');
      const resultDto = Object.assign(new DeleteAccountResDto(), result);

      expect(accountService.deleteAccount).toHaveBeenCalledWith(1);
      expect(resultDto).toBeInstanceOf(DeleteAccountResDto);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      (accountService.deleteAccount as jest.Mock).mockRejectedValue(
        new NotFoundException(
          i18nService.translate('errors.account.not-found'),
        ),
      );

      await expect(accountController.deleteAccount('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
