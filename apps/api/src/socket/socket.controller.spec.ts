import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { SocketController } from '@/socket/socket.controller';
import { SocketService } from '@/socket/socket.service';

describe('SocketController', () => {
  let controller: SocketController;
  let socketService: SocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocketController],
      providers: [
        {
          provide: SocketService,
          useValue: {
            findOneWithAccountId: jest.fn(),
            upsertSocket: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SocketController>(SocketController);
    socketService = module.get<SocketService>(SocketService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(socketService).toBeDefined();
  });
});
