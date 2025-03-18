import { Test, TestingModule } from '@nestjs/testing';

import { DishController } from '@/dish/dish.controller';
import { DishService } from '@/dish/dish.service';

describe('DishController', () => {
  let controller: DishController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishController],
      providers: [DishService],
    }).compile();

    controller = module.get<DishController>(DishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
