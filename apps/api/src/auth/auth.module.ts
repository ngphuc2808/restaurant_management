import { APP_GUARD } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as ms from 'ms';

import { PrismaService } from '@/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { SocketModule } from '@/socket/socket.module';

import { AuthController } from '@/auth/auth.controller';
import { LocalStrategy } from '@/auth/strategies/local.strategy';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn:
            Number(ms(configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'))) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
    SocketModule,
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    RefreshTokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
