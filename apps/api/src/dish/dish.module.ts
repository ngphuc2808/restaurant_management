import { Logger, Module } from '@nestjs/common';

import { DishController } from '@/dish/dish.controller';

import { PrismaService } from '@/prisma.service';
import { DishService } from '@/dish/dish.service';

@Module({
  controllers: [DishController],
  providers: [Logger, PrismaService, DishService],
})
export class DishModule {}
