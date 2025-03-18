import { Module } from '@nestjs/common';

import { OrderService } from '@/order/order.service';
import { OrderController } from '@/order/order.controller';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
