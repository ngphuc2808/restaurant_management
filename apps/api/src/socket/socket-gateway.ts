import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, forwardRef } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { ManagerRoom } from '@/constants/type';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_PUBLIC_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  async afterInit(server: Server) {
    this.logger.log('Initialized!');
  }

  async handleConnection(client: Socket) {
    try {
      const decodedToken = await this.authService.validateSocket(client);
      this.logger.log(`Client connected: ${client.id}`);

      client.handshake.auth.decodedAccessToken = decodedToken;

      if (decodedToken.role !== 'GUEST') {
        client.join(ManagerRoom);
      }
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
