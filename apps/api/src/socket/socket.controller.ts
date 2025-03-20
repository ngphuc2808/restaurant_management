import { Controller } from '@nestjs/common';

import { SocketService } from '@/socket/socket.service';

@Controller('socket')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}
}
