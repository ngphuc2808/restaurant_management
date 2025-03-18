import { Module } from '@nestjs/common';

import { AccountService } from '@/account/account.service';
import { AccountController } from '@/account/account.controller';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
