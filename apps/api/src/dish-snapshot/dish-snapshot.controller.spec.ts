import { Test, TestingModule } from '@nestjs/testing';

import { DishSnapshotController } from '@/dish-snapshot/dish-snapshot.controller';
import { DishSnapshotService } from '@/dish-snapshot/dish-snapshot.service';

describe('DishSnapshotController', () => {
  let controller: DishSnapshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishSnapshotController],
      providers: [DishSnapshotService],
    }).compile();

    controller = module.get<DishSnapshotController>(DishSnapshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
