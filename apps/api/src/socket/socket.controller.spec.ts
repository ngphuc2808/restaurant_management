import { Test, TestingModule } from '@nestjs/testing';

import { SocketController } from '@/socket/socket.controller';
import { SocketService } from '@/socket/socket.service';

describe('SocketController', () => {
  let controller: SocketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocketController],
      providers: [SocketService],
    }).compile();

    controller = module.get<SocketController>(SocketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
