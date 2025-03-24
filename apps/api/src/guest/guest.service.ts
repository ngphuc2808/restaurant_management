import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class GuestService {
  constructor(private readonly prisma: PrismaService) {}
}
