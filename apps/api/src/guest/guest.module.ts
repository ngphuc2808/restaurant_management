import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { GuestController } from '@/guest/guest.controller';

import { PrismaService } from '@/prisma.service';
import { GuestService } from '@/guest/guest.service';
import { TableService } from '@/table/table.service';
import { AuthService } from '@/auth/auth.service';
import { SocketService } from '@/socket/socket.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { AccountService } from '@/account/account.service';
import { SocketGateway } from '@/socket/socket-gateway';
@Module({
  controllers: [GuestController],
  providers: [
    Logger,
    PrismaService,
    JwtService,
    GuestService,
    TableService,
    AuthService,
    SocketService,
    RefreshTokenService,
    AccountService,
    ConfigService,
    SocketGateway,
  ],
})
export class GuestModule {}
