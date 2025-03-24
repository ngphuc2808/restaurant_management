import { Logger, Module } from '@nestjs/common';

import { GuestController } from '@/guest/guest.controller';

import { PrismaService } from '@/prisma.service';
import { GuestService } from '@/guest/guest.service';

@Module({
  controllers: [GuestController],
  providers: [Logger, PrismaService, GuestService],
})
export class GuestModule {}
