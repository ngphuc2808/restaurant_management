import { Module } from '@nestjs/common';

import { TableService } from '@/table/table.service';
import { TableController } from '@/table/table.controller';

@Module({
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
