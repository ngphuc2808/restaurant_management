import { Logger, Module } from '@nestjs/common';

import { SocketModule } from '@/socket/socket.module';
import { OrderController } from '@/order/order.controller';

import { PrismaService } from '@/prisma.service';
import { OrderService } from '@/order/order.service';

@Module({
  controllers: [OrderController],
  imports: [SocketModule],
  providers: [Logger, PrismaService, OrderService],
})
export class OrderModule {}
