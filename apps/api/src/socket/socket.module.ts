import { Logger, Module } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { SocketService } from '@/socket/socket.service';
import { SocketController } from '@/socket/socket.controller';
import { SocketGateway } from '@/socket/socket-gateway';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [SocketController],
  providers: [
    PrismaService,
    SocketGateway,
    SocketService,
    AuthService,
    JwtService,
    RefreshTokenService,
    ConfigService,
    Logger,
  ],
})
export class SocketModule {}
