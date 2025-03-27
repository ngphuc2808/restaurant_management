import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { GuestController } from '@/guest/guest.controller';
import { SocketModule } from '@/socket/socket.module';

import { PrismaService } from '@/prisma.service';
import { GuestService } from '@/guest/guest.service';
import { TableService } from '@/table/table.service';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

@Module({
  controllers: [GuestController],
  imports: [SocketModule],
  providers: [
    Logger,
    PrismaService,
    JwtService,
    GuestService,
    TableService,
    AuthService,
    RefreshTokenService,
  ],
})
export class GuestModule {}
