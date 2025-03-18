import { Test, TestingModule } from '@nestjs/testing';

import { TableController } from '@/table/table.controller';
import { TableService } from '@/table/table.service';

describe('TableController', () => {
  let controller: TableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [TableService],
    }).compile();

    controller = module.get<TableController>(TableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
