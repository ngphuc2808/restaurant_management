import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/prisma.service';
import { IndicatorService } from '@/indicator/indicator.service';
import { IndicatorController } from '@/indicator/indicator.controller';

@Module({
  controllers: [IndicatorController],
  providers: [Logger, ConfigService, PrismaService, IndicatorService],
})
export class IndicatorModule {}
