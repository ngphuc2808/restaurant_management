import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccountController } from '@/account/account.controller';
import { PrismaService } from '@/prisma.service';
import { AccountService } from '@/account/account.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { AuthService } from '@/auth/auth.service';
import { SocketService } from '@/socket/socket.service';
import { SocketGateway } from '@/socket/socket-gateway';

@Module({
  controllers: [AccountController],
  providers: [
    PrismaService,
    JwtService,
    AuthService,
    PrismaService,
    AccountService,
    RefreshTokenService,
    SocketService,
    SocketGateway,
    Logger,
  ],
})
export class AccountModule {}
