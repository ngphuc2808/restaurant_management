import { Logger, Module } from '@nestjs/common';

import { TableController } from '@/table/table.controller';

import { PrismaService } from '@/prisma.service';
import { TableService } from '@/table/table.service';

@Module({
  controllers: [TableController],
  providers: [Logger, PrismaService, TableService],
})
export class TableModule {}
