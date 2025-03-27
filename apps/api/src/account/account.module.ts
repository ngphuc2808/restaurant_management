import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccountController } from '@/account/account.controller';
import { SocketModule } from '@/socket/socket.module';

import { PrismaService } from '@/prisma.service';
import { AccountService } from '@/account/account.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { AuthService } from '@/auth/auth.service';

@Module({
  controllers: [AccountController],
  imports: [SocketModule],
  providers: [
    Logger,
    JwtService,
    PrismaService,
    AccountService,
    AuthService,
    RefreshTokenService,
  ],
})
export class AccountModule {}
