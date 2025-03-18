import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenController } from '@/refresh-token/refresh-token.controller';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;
  let refreshTokenService: RefreshTokenService;

  const mockRefreshTokenService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
      ],
    }).compile();

    controller = module.get<RefreshTokenController>(RefreshTokenController);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
