import { Logger, Module } from '@nestjs/common';

import { RefreshTokenController } from '@/refresh-token/refresh-token.controller';
import { PrismaService } from '@/prisma.service';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

@Module({
  controllers: [RefreshTokenController],
  providers: [Logger, PrismaService, RefreshTokenService],
})
export class RefreshTokenModule {}
