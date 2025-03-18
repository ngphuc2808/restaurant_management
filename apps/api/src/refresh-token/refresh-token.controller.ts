import { Controller } from '@nestjs/common';

import { RefreshTokenService } from '@/refresh-token/refresh-token.service';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}
}
