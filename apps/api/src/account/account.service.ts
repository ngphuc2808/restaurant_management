import { Injectable } from '@nestjs/common';

import { AccountDto } from '@/account/dto/create-account.dto';
import { UpdateAccountDto } from '@/account/dto/update-account.dto';

@Injectable()
export class AccountService {
  create(accountDto: AccountDto) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
