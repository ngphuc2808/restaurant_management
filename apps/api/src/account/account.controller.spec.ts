import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';

import { AccountController } from '@/account/account.controller';
import { AccountService } from '@/account/account.service';
import { CreateAccountReqDto } from '@/account/dto/req/create.req.dto';
import { UpdateAccountReqDto } from '@/account/dto/req/update.req.dto';
import { GetAccountListResDto } from '@/account/dto/res/get-list.res.dto';
import { AccountResDto } from '@/account/dto/res/get-detail.res.dto';
import { DeleteAccountResDto } from '@/account/dto/res/delete.res.dto';
import { PaginationReqDto } from '@/account/dto/req/paginate.req.dto';

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
            create: jest.fn().mockResolvedValue(new AccountResDto()),
            updateAccount: jest.fn().mockResolvedValue(new AccountResDto()),
            deleteAccount: jest
              .fn()
              .mockResolvedValue(new DeleteAccountResDto()),
            getAccountList: jest
              .fn()
              .mockResolvedValue(new GetAccountListResDto()),
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

  describe('create', () => {
    it('should create a new account', async () => {
      const createDto: CreateAccountReqDto = {
        name: 'Test User',
        avatar: '',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      const result = await accountController.create(createDto);
      expect(accountService.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeInstanceOf(AccountResDto);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const updateDto: UpdateAccountReqDto = {
        name: 'Updated User',
        avatar: '',
        email: 'updated@example.com',
        role: 'Employee',
        changePassword: false,
        password: '',
        confirmPassword: '',
      };
      const result = await accountController.updateAccount('1', updateDto);
      expect(accountService.updateAccount).toHaveBeenCalledWith(1, updateDto);
      expect(result).toBeInstanceOf(AccountResDto);
    });
  });

  describe('delete', () => {
    it('should delete an account', async () => {
      const result = await accountController.deleteAccount('1');
      expect(accountService.deleteAccount).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(DeleteAccountResDto);
    });
  });

  describe('getAccountList', () => {
    it('should return a paginated list of accounts', async () => {
      const paginationDto: PaginationReqDto = { page: 1, limit: 10 };
      const result = await accountController.getAccountList(paginationDto);
      expect(accountService.getAccountList).toHaveBeenCalledWith(paginationDto);
      expect(result).toBeInstanceOf(GetAccountListResDto);
    });
  });
});
