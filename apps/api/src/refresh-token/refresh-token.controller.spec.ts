import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { RefreshTokenController } from '@/refresh-token/refresh-token.controller';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [
        {
          provide: RefreshTokenService,
          useValue: {
            createRefreshToken: jest.fn(),
            findToken: jest.fn(),
            deleteToken: jest.fn(),
            invalidateAll: jest.fn(),
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

    controller = module.get<RefreshTokenController>(RefreshTokenController);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(refreshTokenService).toBeDefined();
  });
});
