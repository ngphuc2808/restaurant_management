import { Module } from '@nestjs/common';

import { SocketService } from '@/socket/socket.service';
import { SocketController } from '@/socket/socket.controller';

@Module({
  controllers: [SocketController],
  providers: [SocketService],
})
export class SocketModule {}
