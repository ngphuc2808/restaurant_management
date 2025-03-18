import { Logger, Module } from '@nestjs/common';

import { AccountController } from '@/account/account.controller';
import { PrismaService } from '@/prisma.service';
import { AccountService } from '@/account/account.service';

@Module({
  controllers: [AccountController],
  providers: [PrismaService, AccountService, Logger],
})
export class AccountModule {}
