import { Logger, Module } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { SocketService } from '@/socket/socket.service';
import { SocketController } from '@/socket/socket.controller';
import { SocketGateway } from '@/socket/socket-gateway';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma.service';
import { AccountService } from '@/account/account.service';

@Module({
  controllers: [SocketController],
  providers: [
    Logger,
    JwtService,
    ConfigService,
    PrismaService,
    SocketGateway,
    AuthService,
    AccountService,
    SocketService,
    RefreshTokenService,
  ],
})
export class SocketModule {}
