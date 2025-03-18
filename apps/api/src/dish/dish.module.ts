import { Module } from '@nestjs/common';

import { DishService } from '@/dish/dish.service';
import { DishController } from '@/dish/dish.controller';

@Module({
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule {}
