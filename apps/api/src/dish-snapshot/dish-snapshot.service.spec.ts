import { Test, TestingModule } from '@nestjs/testing';

import { DishSnapshotService } from '@/dish-snapshot/dish-snapshot.service';

describe('DishSnapshotService', () => {
  let service: DishSnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DishSnapshotService],
    }).compile();

    service = module.get<DishSnapshotService>(DishSnapshotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
